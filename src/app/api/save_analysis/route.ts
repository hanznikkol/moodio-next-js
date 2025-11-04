import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userProfile, track, analysisResult } = await req.json();

    // Upsert user
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .upsert({
        spotify_id: userProfile.id,
        display_name: userProfile.display_name,
        avatar_url: userProfile.images?.[0]?.url || null,
      }, {onConflict: "spotify_id"})
      .select("user_id")
      .single();
    if (userError) throw userError;

    // Upsert song
    const { data: song, error: songError } = await supabaseAdmin
      .from("songs")
      .upsert({
        spotify_id: track.id,
        name: track.name,
        artist: track.artists,
        preview_url: track.preview_url,
        spotify_url: track.spotify_url,
      })
      .select("song_id")
      .single();
    if (songError) throw songError;

    // Save analysis
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from("analyses")
      .insert({
        user_id: user.user_id,
        song_id: song.song_id,
        mood: analysisResult.mood,
        explanation: analysisResult.explanation,
        color_palette: analysisResult.colorPalette,
        lyrics: analysisResult.lyrics ?? null,
      })
      .select("analyses_id")
      .single();
    if (analysisError) throw analysisError;

    // Save recommended tracks
    if (analysisResult.recommendedTracks?.length) {
      const recs = analysisResult.recommendedTracks.map((r: any) => ({
        analyses_id: analysis.analyses_id,
        name: r.name,
        artists: r.artist,
        note: r.note,
        image: r.image,
        uri: r.uri,
      }));
      const { error: recError } = await supabaseAdmin
        .from("recommended_tracks")
        .insert(recs);
      if (recError) throw recError;
    }

    return NextResponse.json({ saved: analysis });
  } catch (err: any) {
    console.error("Error in API route:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
