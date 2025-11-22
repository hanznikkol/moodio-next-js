import { supabaseAdmin } from "@/lib/supabase/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url)
    const analysesId = searchParams.get("analysesId")

    if (!analysesId) {
        return NextResponse.json({ error: "Missing analysis ID" }, { status: 400 });
    }

    const {data, error} = await supabaseAdmin
    .from("analyses")
    .select(`
      analyses_id,
      mood,
      explanation,
      color_palette,
      created_at,
      songs (
        name,
        artist
      ), 
      recommended_tracks (
          name,
          artists,
          uri,
          image
      ),
      users (
        spotify_id
      )
    `)
    .eq("analyses_id", analysesId)
    .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}