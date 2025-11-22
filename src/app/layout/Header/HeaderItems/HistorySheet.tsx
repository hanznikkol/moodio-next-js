"use client";

import { History } from "lucide-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { createSupabaseClient } from "@/lib/supabase/supabaseClient";
import { HistoryItem, MergedHistoryItem } from "@/lib/history/historyTypes";
import LoadingSpinner from "@/app/main_components/LoadingSpinner";
import { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";

interface HistorySheetProps {
    onSelectHistory: (analysis: AnalysisResult) => void
}

export default function HistorySheet({onSelectHistory}: HistorySheetProps) {
  const { profile, appJWT } = useSpotify();
  const supabase = appJWT ? createSupabaseClient(appJWT) : null;

  const [history, setHistory] = useState<MergedHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // merging logic stays the same
  const mergeHistoryBySong = (history: HistoryItem[]): MergedHistoryItem[] => {
    const map = new Map<string, MergedHistoryItem>();

    for (const item of history) {
      const key = `${item.songs?.name}-${item.songs?.artist}-${item.mood}`;

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.count++;
        if (new Date(item.created_at) > new Date(existing.latestTime)) {
          existing.latestTime = item.created_at;
        }
      } else {
        map.set(key, { ...item, key, count: 1, latestTime: item.created_at });
      }
    }

    return Array.from(map.values());
  };

  const grouped = history.reduce<Record<string, MergedHistoryItem[]>>((acc, item) => {
    const date = item.latestTime.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Fetch history
  useEffect(() => {
    if (!profile?.id) return;

    const fetchHistory = async () => {
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

    fetchHistory();
  }, [profile?.id]);

  // Realtime changes
  useEffect(() => {
    if (!profile || !supabase) return;

    const channel = supabase
      .channel("realtime-analyses")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analyses",
          filter: `spotify_id=eq.${profile.id}`,
        },
        async (payload) => {
          try {
            const res = await axios.get(
              `/api/database_server/get_analyses_by_id?analysesId=${payload.new.analyses_id}`
            );
            const newItem = res.data;
            setHistory((prev) => mergeHistoryBySong([newItem, ...prev]));
          } catch (err) {
            console.error("Realtime fetch error:", err);
          }
        }
      );

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase]);

  if (!profile) return null;

  //Handle Click
  const handleClickItem = async (item: MergedHistoryItem) => {
    try {
        const res = await axios.get('/api/database_server/get_analyses_by_id', {
            params: { analysesId: item.analyses_id }
        })

        const raw: any = res.data;
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
        onSelectHistory(analysis)
    } catch(err) {
        console.error("Error fetching analysis by ID:", err);
    }
  }

  return (
    <Sheet>
      <SheetTrigger className="flex items-center gap-2 bg-white/20 hover:bg-white/50 px-3 py-2 text-black dark:text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-black/20 dark:border-white/10">
        <History className="w-5 h-5" />
            History
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] lg:w-[400px]">
        <SheetHeader>
          <SheetTitle>Song History</SheetTitle>
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
                        <p className="font-medium">{item.songs?.name}</p>
                        <p className="text-sm text-gray-400">{item.songs?.artist}</p>
                        <p className="text-xs italic">{item.mood}</p>
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
