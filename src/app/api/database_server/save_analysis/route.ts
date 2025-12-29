import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientWithJWT, getUserIdFromJWT } from "@/lib/supabase/supabaseClientHelper";
import { DAILY_LIMIT } from "@/lib/config/creditsLimit";

export async function POST(req: NextRequest) {
  try {
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwt) throw new Error("Missing JWT");

    const supabaseClientJWT = getSupabaseClientWithJWT(jwt)
    const userId = await getUserIdFromJWT(jwt)
    const today = new Date().toISOString().split("T")[0]

    const { track, analysisResult } = await req.json();

    //== Save to database ==
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
    console.log("Song upsert response:", { data: song, error: songError });
    if (songError) throw songError;

    // Save analysis
    const { data: analysis, error: analysisError } = await supabaseClientJWT
      .from("analyses")
      .insert({
        user_id: userId,
        song_id: song.song_id,
        mood: analysisResult.mood,
        explanation: analysisResult.explanation,
        color_palette: JSON.parse(JSON.stringify(analysisResult.colorPalette)),
        lyrics: analysisResult.lyrics ?? null,
      })
      .select("analyses_id")
      .single();
    console.log("Analysis result from AI:", analysisResult);
    if (analysisError) throw analysisError;

    // Save recommended tracks
    if (analysisResult.recommendedTracks?.length) {
      const recs = analysisResult.recommendedTracks.map((r: any) => ({
        analyses_id: analysis.analyses_id,
        name: r.name,
        artists: Array.isArray(r.artist) ? r.artist.filter(Boolean).join(", ") : r.artist ?? "Unknown Artist",
        note: r.note ? String(r.note) : null,
        image: r.image ?? null,
        uri: r.uri ?? null,
      }));

      const { error: recError } = await supabaseClientJWT
        .from("recommended_tracks")
        .insert(recs);
      if (recError) throw recError;
    }

    // Save to song_history
    const { data: songHistory, error: historyError } = await supabaseClientJWT
      .from("song_history")
      .upsert({
        user_id: userId,
        analyses_id: analysis.analyses_id,
        is_favorite: false,
        is_archived: false,        
        count: 1, 
      }, { onConflict: "user_id, analyses_id"});

    console.log("Song history insert", songHistory)
    if (historyError) throw historyError;
    
    //== Consume Credits ==
    const {data: creditData, error: creditError} = await supabaseClientJWT
      .from("daily_user_credits")
      .select("used_count")
      .eq("user_id", userId)
      .eq("used_on", today)
      .single()

    if (creditError && creditError.code !== "PGRST116") throw creditError

    let remainingCredits: number
    if (!creditData) {
      await supabaseClientJWT.from("daily_user_credits").insert({
          user_id: userId,
          used_on: today,
          used_count: 1,
      });

      remainingCredits = DAILY_LIMIT - 1
    } else {
      //Reach Limit
      if (creditData.used_count >= DAILY_LIMIT) {
        return NextResponse.json({error: "Daily credit limit"}, {status: 403})
      }

      await supabaseClientJWT
        .from("daily_user_credits")
        .update({used_count: creditData.used_count + 1})
        .eq("user_id", userId)
        .eq("used_on", today)
      
      remainingCredits = DAILY_LIMIT - (creditData.used_count + 1)
    }

    return NextResponse.json({ saved: analysis, remainingCredits});
  } catch (err: any) {
    console.error("Error in API route:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
