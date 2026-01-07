'use client'

import { History, RefreshCw } from "lucide-react";
import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { MergedHistoryItem } from "@/lib/history/historyTypes";
import LoadingSpinner from "@/app/main_components/LoadingSpinner";
import { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import { archiveItem, fetchAnalysisById, fetchHistoryBySpotifyId, mergeHistoryBySong, subscribeToRealtimeHistory, updateFavorite } from "@/lib/history/historyHelper";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import HistoryItemComponent from "./HistoryItemComponent";

interface HistorySheetProps {
  supabaseUserId: string
  onSelectHistory: (analysis: AnalysisResult) => void
  onRestoreItem?: (item: MergedHistoryItem) => void; 
}

export default function HistorySheet({ supabaseUserId, onSelectHistory }: HistorySheetProps) {
  const { profile } = useSpotify();

  const historyCache = useRef<MergedHistoryItem[] | null>(null);
  const analysesCache = useRef<Record<string, AnalysisResult>>({});
  const realtimeUnsubscribe = useRef<(() => void) | null>(null);
  const favoriteLock = useRef<Set<string>>(new Set())

  const [searchQuery, setSearchQuery] = useState("")
  const [history, setHistory] = useState<MergedHistoryItem[]>(historyCache.current ?? []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const setHistoryAndCache = (updater: React.SetStateAction<MergedHistoryItem[]>) => {
    setHistory(prev => {
      const newState = typeof updater === "function" ? (updater as Function)(prev) : updater;
      historyCache.current = newState;
      return newState;
    });
  };

  const handleFavorites = async (item: MergedHistoryItem, newItem: boolean) => {
    if (!supabaseUserId) return
    if (favoriteLock.current.has(item.analyses_id)) return
    favoriteLock.current.add(item.analyses_id)

    setHistory(prev => prev.map(h => h.analyses_id === item.analyses_id ? {...h, is_favorite: newItem} : h))

    if(newItem) {
      toast.success("Added to Favorites")
    } else {
      toast.warning("Removed from Favorites")
    }
    try {
      await updateFavorite(supabaseUserId, item.analyses_id, newItem)
    } catch(err) {
      console.error(err);
      setHistory(prev => prev.map(h => h.analyses_id === item.analyses_id ? { ...h, is_favorite: !newItem } : h));
      toast.error("Failed to add favorite");
    } finally {
      favoriteLock.current.delete(item.analyses_id)
    }
  }

  const handleArchive = async (item: MergedHistoryItem, archive: boolean = true) => {
    if (!supabaseUserId) return
    setHistory(prev => {
      const newState = prev.filter(h => h.analyses_id !== item.analyses_id);
      historyCache.current = newState;
      return newState;
    });

    try {
      await archiveItem(supabaseUserId, item.analyses_id, archive)
      toast.success(archive ? "Archived Successfully" : "Restored successfully")
    } catch (err) {
      console.error("Failed to delete")
      toast.error("Failed to delete");
      setHistory(prev => [...prev, item]);
    }
  }

  const handleOpenSheet = async () => {
    setOpenSheet(true);
    if (!profile) return;

    if (!realtimeUnsubscribe.current && supabaseUserId) {
      realtimeUnsubscribe.current = subscribeToRealtimeHistory(
        supabaseUserId,
        setHistoryAndCache,
        historyCache
      );
    }

    if (!historyCache.current?.length) {
      setLoading(true);
      try {
        const fetchedHistory = await fetchHistoryBySpotifyId(profile.id);
        setHistoryAndCache(mergeHistoryBySong(fetchedHistory));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    } else {
      setHistoryAndCache(historyCache.current);
    }
  }

  const handleRefresh = async () => {
    if (!profile) return;
    setRefreshing(true);
    try {
      const fetchedHistory = await fetchHistoryBySpotifyId(profile.id);
      setHistoryAndCache( mergeHistoryBySong([...(historyCache.current || []), ...fetchedHistory]));
    } catch (err) {
      toast.error("Failed refresh");
    } finally {
      setRefreshing(false);
    }
  };

  const handleClickItem = useCallback( async (item: MergedHistoryItem) => {
    if (analysesCache.current[item.analyses_id]) {
      onSelectHistory(analysesCache.current[item.analyses_id]);
      return;
    }
 
    try {
      setLoadingItemId(item.analyses_id);
      const analysisFromApi = await fetchAnalysisById(item.analyses_id)

      const analysis: AnalysisResult = {
        analysesId: item.analyses_id,
        ...analysisFromApi,
        trackName: item.songs?.name ?? "Unknown",
        trackArtist: item.songs?.artist ?? "Unknown",
      }

      analysesCache.current[item.analyses_id] = analysis;
      onSelectHistory(analysis);
    } catch (err) {
      console.error("Error item analysis:", err);
    } finally {
      setLoadingItemId(null);
    }
  }, [onSelectHistory]) 

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history
    const query = searchQuery.toLowerCase()

    return history.filter(item => {
      const songName = item.songs.name.toLowerCase() ?? ""
      const artist = item.songs?.artist?.toLowerCase() ?? "";
      const mood = item.mood?.toLowerCase() ?? "";
      const date = new Date(item.latestTime).toLocaleDateString().toLowerCase();

      return (
        songName.includes(query) ||
        artist.includes(query) ||
        mood.includes(query) ||
        date.includes(query)
      );
    })
  }, [history, searchQuery])
  
  const favorites = useMemo(() => {
    return filteredHistory.filter(item => item.is_favorite);
  }, [filteredHistory]);

  const nonFavorites = useMemo(() => {
    return filteredHistory.filter(item => !item.is_favorite);
  }, [filteredHistory]);

  //Group Items and Sorted Dates
  const { grouped: groupedNonFav, sortedDates: sortedDatesNonFav } = useMemo(() => {
    const g = nonFavorites.reduce<Record<string, MergedHistoryItem[]>>((acc, item) => {
      const latestTime = item.latestTime ?? item.created_at ?? new Date().toISOString();
      const date = latestTime.split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});

    const s = Object.keys(g).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return { grouped: g, sortedDates: s };
  }, [nonFavorites]);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger onClick={handleOpenSheet} className="flex items-center gap-2 bg-white/20 hover:bg-white/50 px-3 py-2 text-black dark:text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-black/20 dark:border-white/10">
        <History className="w-5 h-5" />
        History
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] lg:w-[400px]">
        <SheetHeader className="flex flex-col gap-2">
          <SheetTitle>Song History</SheetTitle>
          <SheetDescription></SheetDescription>

          <div className="flex items-center gap-4">
            {/* Search */}
            <Input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 text-sm text-cyan-500 hover:text-cyan-400"
              >
                {refreshing ? <LoadingSpinner size="small"/> : <RefreshCw className="w-4 h-4"/>}
            </button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto p-2">
          {loading ? ( <LoadingSpinner color="border-cyan-400" />) : history.length === 0 ? (
            <p className="text-center text-gray-400">No history yet.</p>
          ) : (
            <div className="space-y-6">
              {/* Favorites */}
              {favorites.length > 0 && (
                <>
                  <p className="font-semibold mb-2">Favorites</p>
                  <ul className="space-y-3">
                    {favorites.map(item => (
                      <HistoryItemComponent
                        key={item.analyses_id}
                        item={item}
                        loadingItemId={loadingItemId}
                        onClick={handleClickItem}
                        onArchive={handleArchive}
                        onFavorite={handleFavorites}
                        showRestore={false}  
                      />
                    ))}
                  </ul>
                </>
              )}

              {/* List */}
              {sortedDatesNonFav.map((date) => (
                <React.Fragment key={date}>
                  <p className="font-semibold mb-2">
                    {new Date(date).toLocaleDateString()}
                  </p>

                  <ul className="space-y-3">
                    {groupedNonFav[date].map((item) => (
                      <HistoryItemComponent
                        key={item.analyses_id}
                        item = {item}
                        loadingItemId = {loadingItemId}
                        onClick = {handleClickItem}
                        onArchive={handleArchive}
                        onFavorite={handleFavorites}
                        showRestore={false}
                      />
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
