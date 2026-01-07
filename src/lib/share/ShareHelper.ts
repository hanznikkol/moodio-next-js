import { AnalysisResult, Song } from "../analysisMoodLib/analysisResult";
import { supabaseAdmin } from "../supabase/supabaseServer";

interface AnalysisQueryResult {
  analysis: AnalysisResult | null;
  error?: string;
}

export async function getAnalysis(id: string): Promise<AnalysisQueryResult> {
  const { data, error } = await supabaseAdmin
    .from("analyses")
    .select(`
      analyses_id,
      mood,
      explanation,
      lyrics,
      color_palette,
      created_at,
      songs:song_id (
        song_id,
        name,
        artist,
        spotify_url,
        preview_url
      ),
      recommended_tracks (
        name,
        artists,
        uri,
        image
      ),
      users:user_id (
        spotify_id
      )
    `)
    .eq("analyses_id", id)
    .single();

  if (error || !data) {
    return { analysis: null, error: error?.message ?? "Analysis not found" };
  }

  // Handle song object vs array
  const song: Song = Array.isArray(data.songs) ? data.songs[0] : data.songs;

  const analysis: AnalysisResult = {
    analysesId: data.analyses_id,
    mood: data.mood,
    explanation: data.explanation,
    lyrics: data.lyrics ?? null,
    colorPalette: data.color_palette ?? [],
    recommendedTracks: (data.recommended_tracks ?? []).map(track => ({
      name: track.name,
      artist: Array.isArray(track.artists) ? track.artists.join(", ") : track.artists ?? "Unknown Artist",
      uri: track.uri ?? undefined,
      image: track.image ?? undefined,
    })),
    trackName: song?.name ?? "Unknown",
    trackArtist: song?.artist ?? "Unknown",
    spotifyTrackId: song?.spotify_url ?? undefined,
  };

  return { analysis };
}