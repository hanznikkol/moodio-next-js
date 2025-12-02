'use client'

import { History, RefreshCw } from "lucide-react";
import axios from "axios";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { HistoryItem, MergedHistoryItem } from "@/lib/history/historyTypes";
import LoadingSpinner from "@/app/main_components/LoadingSpinner";
import { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import { mergeHistoryBySong } from "@/lib/history/historyHelper";
import { supabase } from "@/lib/supabase/supabaseClient";

interface HistorySheetProps {
  supabaseUserId: string
  onSelectHistory: (analysis: AnalysisResult) => void
}

export default function HistorySheet({ supabaseUserId, onSelectHistory }: HistorySheetProps) {
  const { profile } = useSpotify();
  const [history, setHistory] = useState<MergedHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  // Cache analyses to avoid repeated API calls
  const analysesCache = useRef<Record<string, AnalysisResult>>({});

  const fetchHistory = async () => {
    if (!profile) return
    setLoading(true);
    try {
      const res = await axios.get("/api/database_server/get_history", {
        params: { spotifyId: profile.id },
      });
      setHistory(mergeHistoryBySong(res.data));
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSheet = async () => {
    setOpenSheet(true);
    if (history.length === 0) await fetchHistory();
  };

  const handleClickItem = async (item: MergedHistoryItem) => {
    if (analysesCache.current[item.analyses_id]) {
      onSelectHistory(analysesCache.current[item.analyses_id]);
      return;
    }

    try {
      setLoadingItemId(item.analyses_id);

      const res = await axios.get('/api/database_server/get_analyses_by_id', {
        params: { analysesId: item.analyses_id }
      });

      const raw = res.data;
      const analysis: AnalysisResult = {
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
        trackName: item.songs?.name ?? "Unknown",
        trackArtist: item.songs?.artist ?? "Unknown"
      };

      // Cache it
      analysesCache.current[item.analyses_id] = analysis;
      onSelectHistory(analysis);

    } catch (err) {
      console.error("Error fetching analysis by ID:", err);
    } finally {
      setLoadingItemId(null);
    }
  }

  const { grouped, sortedDates } = useMemo(() => {
    const g = history.reduce<Record<string, MergedHistoryItem[]>>((acc, item) => {
      const date = item.latestTime.split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});

    const s = Object.keys(g).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return { grouped: g, sortedDates: s };
  }, [history]);

   // Realtime History
  useEffect(() => {
    if (!supabaseUserId) return;
    console.log(supabaseUserId)
    const channel = supabase
      .channel("realtime-analyses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analyses",
          filter: `user_id=eq.${supabaseUserId}`,
        },
        async (payload) => {
          console.log("Realtime payload:", payload);

          // INSERT
          if (payload.eventType === "INSERT") {
            const { data: song } = await supabase
              .from("songs")
              .select("name, artist")
              .eq("song_id", payload.new.song_id)
              .single();

            if (!song) return;

            const newItem: HistoryItem = {
              analyses_id: payload.new.analyses_id,
              created_at: payload.new.created_at,
              mood: payload.new.mood,
              track_name: song.name,
              songs: { name: song.name, artist: song.artist },
            };

            setHistory((prev) =>
              mergeHistoryBySong([newItem, ...prev ])
            );
          }

          // UPDATE
          if (payload.eventType === "UPDATE") {
            setHistory((prev) => {
              const updated = prev.map((item) =>
                item.analyses_id === payload.new.analyses_id
                  ? {
                      ...item,
                      mood: payload.new.mood,
                      created_at: payload.new.created_at,
                      latestTime: payload.new.created_at,
                    }
                  : item
              );

              return mergeHistoryBySong(updated);
            });
          }

          // DELETE
          if (payload.eventType === "DELETE") {
            setHistory((prev) =>
              mergeHistoryBySong(
                prev.filter(
                  (item) =>
                    item.analyses_id !== payload.old.analyses_id
                )
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUserId]);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger onClick={handleOpenSheet} className="flex items-center gap-2 bg-white/20 hover:bg-white/50 px-3 py-2 text-black dark:text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-black/20 dark:border-white/10">
        <History className="w-5 h-5" />
        History
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] lg:w-[400px]">
        <SheetHeader className="flex flex-col gap-2">
          <SheetTitle>Song History</SheetTitle>
          <button
            onClick={fetchHistory}
            className="flex items-center gap-1 text-sm text-cyan-500 hover:text-cyan-400"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </SheetHeader>

        <ScrollArea className="h-[90vh] p-2">
          {loading ? (
            <LoadingSpinner color="border-cyan-400" />
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400">No history yet.</p>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <React.Fragment key={date}>
                  <p className="font-semibold mb-2">
                    {new Date(date).toLocaleDateString()}
                  </p>

                  <ul className="space-y-3">
                    {grouped[date].map((item) => (
                      <li
                        key={item.analyses_id}
                        className="group cursor-pointer border hover:border-cyan-400 hover:bg-white/10 transition-colors duration-200 rounded-lg p-3 bg-white/5 flex flex-col gap-1"
                        onClick={() => handleClickItem(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.songs?.name}</p>
                            <p className="text-sm text-gray-400">{item.songs?.artist}</p>
                            <p className="text-xs italic">{item.mood}</p>
                            {item.count > 1 && (
                              <p className="text-xs text-cyan-400">analyzed {item.count} times</p>
                            )}
                          </div>
                          {loadingItemId === item.analyses_id && <LoadingSpinner color="border-cyan-400" size="small" />}
                        </div>
                        <p className="text-xs text-gray-400">
                          Latest: {new Date(item.latestTime).toLocaleTimeString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
