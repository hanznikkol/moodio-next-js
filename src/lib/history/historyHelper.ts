import axios from "axios";
import { MergedHistoryItem, HistoryItem, SongHistoryRow } from "./historyTypes";
import { supabase } from "../supabase/supabaseClient";
import { RecommendedTrack } from "../analysisMoodLib/analysisResult";

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
    recommendedTracks: (raw.recommended_tracks || []).map((t: RecommendedTrack) => ({
      id: t.id,
      name: t.name,
      artist: t.artist,
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
      map.set(key, { ...item, key, count: 1, latestTime: item.created_at ?? new Date().toISOString(),  is_archived: 'is_archived' in item ? item.is_archived : false });
    }
  }

  return Array.from(map.values());
};

export const updateFavorite = async (userId: string, analyses_id: string, isFavorite: boolean) => {
  const {error} = await supabase
    .from("song_history")
    .update({ is_favorite: isFavorite})
    .eq("user_id", userId)
    .eq("analyses_id", analyses_id)
  if (error) throw error;
}

export const fetchArchivedHistory = async (userId: string): Promise<MergedHistoryItem[]> => {
  const res = await fetch(`/api/database_server/get_archived?userId=${userId}`);
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error("Expected array but got:", data);
    return [];
  }

  return data;
}

export const archiveItem = async (supabaseUserId: string, analyses_id: string, archive: boolean = true) => {
  const {error: errorArchive} = await supabase
    .from("song_history")
    .update({is_archived: archive})
    .eq("analyses_id", analyses_id)
    .eq("user_id", supabaseUserId)

  if (errorArchive) return
  return true
}

export const deleteHistoryItem = async (supabaseUserId: string, analyses_id: string) => {
  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("song_id")
    .eq("analyses_id", analyses_id)
    .eq("user_id", supabaseUserId)
    .single();
  if (analysisError || !analysis) return;
  
  const songId = analysis.song_id;

  await supabase
    .from("recommended_tracks")
    .delete()
    .eq("analyses_id", analyses_id);

  await supabase
    .from("song_history")
    .delete()
    .eq("analyses_id", analyses_id)
    .eq("user_id", supabaseUserId);

  await supabase
    .from("analyses")
    .delete()
    .eq("analyses_id", analyses_id)
    .eq("user_id", supabaseUserId); 

  const { data: remainingAnalyses } = await supabase
    .from("analyses")
    .select("analyses_id")
    .eq("song_id", songId);
  
  if (!remainingAnalyses || remainingAnalyses.length === 0) {
    await supabase
      .from("songs")
      .delete()
      .eq("song_id", songId);
  }

  return true
}

//REALTIME 
export const subscribeToRealtimeHistory = (
  supabaseUserId: string,
  updater: React.Dispatch<React.SetStateAction<MergedHistoryItem[]>>,
  cache?: React.MutableRefObject<MergedHistoryItem[] | null>
) => {
  
  const handleUpdate = (newState: MergedHistoryItem[]) => {
    if (cache) cache.current = newState;
    return newState;
  };

  const channel = supabase
    .channel("realtime-history")
    .on("postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "song_history",
        filter: `user_id=eq.${supabaseUserId}`
      },
      async (payload) => {
        const row = payload.new as SongHistoryRow;
        // INSERT
        if (payload.eventType === "INSERT") {
           const { data: analysis } = await supabase
            .from("analyses")
            .select("mood, created_at, song_id")
            .eq("analyses_id", row.analyses_id)
            .single();

          if (!analysis) return;

          const { data: song } = await supabase
            .from("songs")
            .select("name, artist")
            .eq("song_id", analysis.song_id)
            .single();

          if (!song) return;

          const newItem: MergedHistoryItem = {
            analyses_id: row.analyses_id,
            created_at: analysis.created_at,
            latestTime: analysis.created_at,
            mood: analysis.mood,
            track_name: song.name,
            songs: { name: song.name, artist: song.artist },
            is_favorite: row.is_favorite ?? false,
            is_archived: row.is_archived ?? false,
            count: 1,
            key: `${song.name}-${song.artist}-${analysis.mood}`,
          };

          updater(prev => handleUpdate(mergeHistoryBySong([newItem, ...prev])));
        }

        // UPDATE
        if (payload.eventType === "UPDATE") {
          const row = payload.new as SongHistoryRow;
          const oldRow = payload.old as SongHistoryRow;
          const { analyses_id, is_archived, is_favorite } = row;

          const wasRestored = oldRow?.is_archived === true && row.is_archived === false;

          if (wasRestored) {
            // Fetch analysis details
            const { data: analysis } = await supabase
              .from("analyses")
              .select("mood, created_at, song_id")
              .eq("analyses_id", analyses_id)
              .single();
            if (!analysis) return;

            // Fetch song details
            const { data: song } = await supabase
              .from("songs")
              .select("name, artist")
              .eq("song_id", analysis.song_id)
              .single();
            if (!song) return;

            const newItem: MergedHistoryItem = {
              analyses_id,
              mood: analysis.mood,
              created_at: analysis.created_at,
              latestTime: analysis.created_at,
              track_name: song.name,
              songs: { name: song.name, artist: song.artist },
              is_favorite: is_favorite ?? false,
              is_archived: false,
              count: 1,
              key: `${song.name}-${song.artist}-${analysis.mood}`,
            };

            updater(prev => {
              const combined = [...prev, newItem];
                    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              return handleUpdate(mergeHistoryBySong(combined));
            });
            return;
          }

          // Otherwise, normal update
          updater(prev => {
            const updated = prev
              .map(i =>
                i.analyses_id === analyses_id
                  ? { ...i, is_archived, is_favorite }
                  : i
              )
              .filter(i => !i.is_archived);

            return handleUpdate(mergeHistoryBySong(updated));
          });
        }

      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
