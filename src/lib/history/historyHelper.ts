import axios from "axios";
import { MergedHistoryItem, HistoryItem } from "./historyTypes";
import { supabase } from "../supabase/supabaseClient";

//Fetch History
export const fetchHistoryBySpotifyId = async (spotifyId: string) => {
  const res = await axios.get("/api/database_server/get_history", { params: { spotifyId } });
  return res.data;
}

//Fetch History Item
export const fetchAnalysisById = async (analysesId: string) => {
  const res = await axios.get("/api/database_server/get_analyses_by_id", { params: { analysesId } });
  const raw = res.data;
  return {
    mood: raw.mood,
    explanation: raw.explanation,
    colorPalette: raw.color_palette || [],
    lyrics: raw.lyrics ?? null,
    spotifyTrackId: raw.spotify_track_id,
    recommendedTracks: (raw.recommended_tracks || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists,
      note: t.note,
      image: t.image,
      uri: t.uri,
    })),
  };
}

export const mergeHistoryBySong = ( history: (HistoryItem | MergedHistoryItem)[]): MergedHistoryItem[] => {
  const map = new Map<string, MergedHistoryItem>();

  for (const item of history) {
    const key = `${item.songs.name}-${item.songs.artist}-${item.mood}`;

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.count++;
      if (new Date(item.created_at) > new Date(existing.latestTime)) {
        existing.latestTime = item.created_at;
      }
    } else {
      map.set(key, { ...item, key, count: 1, latestTime: item.created_at ?? new Date().toISOString()});
    }
  }

  return Array.from(map.values());
};


//REALTIME 
export const subscribeToRealtimeHistory = (
  supabaseUserId: string, 
  updater: React.Dispatch<React.SetStateAction<MergedHistoryItem[]>>,
  cache?: React.MutableRefObject<MergedHistoryItem[] | null>
  ) => {
  const channel = supabase
    .channel("realtime-analyses")
    .on( "postgres_changes" , 
      {
        event: "*",
        schema: "public",
        table: "analyses",
        filter: `user_id=eq.${supabaseUserId}`
      }, async (payload) => {
        
        const handleUpdate = (newState: MergedHistoryItem[]) => {
          if(cache) cache.current = newState
          return newState
        }

        //Insert
        if (payload.eventType === "INSERT") {
          const { data: song } = await supabase
            .from("songs")
            .select("name, artist")
            .eq("song_id", payload.new.song_id)
            .single();
          if (!song) return;

          const newItem = {
            analyses_id: payload.new.analyses_id,
            created_at: payload.new.created_at,
            mood: payload.new.mood,
            track_name: song.name,
            songs: { name: song.name, artist: song.artist },
            latestTime: payload.new.created_at,
          };
          updater((prev) => handleUpdate(mergeHistoryBySong([newItem, ...prev])));
        }

        //Update
        if (payload.eventType === "UPDATE") {
          updater((prev) =>
            handleUpdate(  
              mergeHistoryBySong(
                prev.map((item) =>
                  item.analyses_id === payload.new.analyses_id
                    ? { ...item, mood: payload.new.mood, created_at: payload.new.created_at, latestTime: payload.new.created_at }
                    : item
                )
              )
            )
          );
        }

        if (payload.eventType === "DELETE") {
          updater((prev) =>
            handleUpdate(mergeHistoryBySong(prev.filter((item) => item.analyses_id !== payload.old.analyses_id)))
          );
        }
      })
    .subscribe()

    return () => supabase.removeChannel(channel)
}
