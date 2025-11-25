import { MergedHistoryItem, HistoryItem } from "./historyTypes";

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
      map.set(key, { ...item, key, count: 1, latestTime: item.created_at });
    }
  }

  return Array.from(map.values());
};
