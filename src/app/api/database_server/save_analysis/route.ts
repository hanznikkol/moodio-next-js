import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwt) throw new Error("Missing JWT");

    const supabaseClientJWT = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user }, error } = await supabaseClientJWT.auth.getUser();
    if (error || !user) throw new Error("No authenticated user found");

    const { track, analysisResult } = await req.json();

    // Upsert song
    const simpleArtist = Array.isArray(track.artists) ? track.artists.join(", ") : track.artists;
    const { data: song, error: songError } = await supabaseClientJWT
      .from("songs")
      .upsert({
        spotify_id: track.id,
        name: track.name,
        artist: simpleArtist,
        preview_url: track.preview_url,
        spotify_url: track.spotify_url,
      }, {onConflict: "spotify_id"})
      .select("song_id")
      .single();
    if (songError) throw songError;

    // Save analysis
    const { data: analysis, error: analysisError } = await supabaseClientJWT
      .from("analyses")
      .insert({
        user_id: user.id,
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
        artists: Array.isArray(r.artist) ? r.artist.filter(Boolean).join(", ") : r.artist ?? "Unknown Artist",
        note: r.note ?? null,
        image: r.image ?? null,
        uri: r.uri ?? null,
      }));

      const { error: recError } = await supabaseClientJWT
        .from("recommended_tracks")
        .insert(recs);
      if (recError) throw recError;
    }

    // Save to song_history
    const { error: historyError } = await supabaseClientJWT
      .from("song_history")
      .upsert({
        user_id: user.id,
        analyses_id: analysis.analyses_id,
        is_favorite: false,        
        count: 1, 
      }, { onConflict: "unique_user_analysis" });

    if (historyError) throw historyError;


    return NextResponse.json({ saved: analysis });
    
    
  } catch (err: any) {
    console.error("Error in API route:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
