export type HistoryItem = {
  track_name: string;
  analyses_id: string;
  created_at: string;
  mood: string;
  songs: {
    name: string;
    artist: string;
  };
};

export type MergedHistoryItem = HistoryItem & {
  key: string;
  count: number;
  latestTime: string;
};