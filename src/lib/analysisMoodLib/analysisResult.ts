export type RecommendedTrack = {
  id?: string;
  name: string;
  artist: string;
  note?: string;
  image?: string;
  uri?: string | null;
};

export type AnalysisResult = {
  mood: string;
  explanation: string;
  colorPalette: string[];
  spotifyTrackId?: string;
  lyrics?: string | null;
  recommendedTracks: RecommendedTrack[];
  trackName: string;
  trackArtist: string
}    

export type PlaybackState = {
  selectedTrackID: string | null;
  currentTrack: { name: string; artists: string } | null;
  moodAnalysis: AnalysisResult | null;
  loading: boolean;
};