export type HistoryItem = {
  track_name: string;
  analyses_id: string;
  created_at: string;
  mood: string;
  is_favorite: boolean;
  songs: {
    name: string;
    artist: string;
  };
};

export type MergedHistoryItem = HistoryItem & {
  key: string;
  count: number;
  latestTime: string;
  is_archived: boolean
};

export type SongHistoryRow = {
  user_id: string;
  analyses_id: string;
  is_favorite: boolean;
  is_archived: boolean;
  count: number;
  created_at: string;
};