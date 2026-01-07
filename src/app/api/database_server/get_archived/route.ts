import { supabaseAdmin } from "@/lib/supabase/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("song_history")
      .select(`
        analyses_id,
        is_favorite,
        is_archived,
        count,
        analyses:analyses_id (
          mood,
          created_at,
          songs:song_id (
            name,
            artist
          )
        )
      `)
      .eq("user_id", userId)
      .eq("is_archived", true)
      .order("created_at", { ascending: false, referencedTable: "analyses" });

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = data.map((item: any) => ({
      analyses_id: item.analyses_id,
      is_favorite: item.is_favorite,
      is_archived: item.is_archived,
      count: item.count,
      mood: item.analyses.mood,
      created_at: item.analyses.created_at,
      songs: {
        name: item.analyses.songs.name,
        artist: item.analyses.songs.artist
      },
      track_name: item.analyses.songs.name,
      key: `${item.analyses.songs.name}-${item.analyses.songs.artist}-${item.analyses.mood}`
    }));

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    let message = "Server error";
    if (err instanceof Error) message = err.message;

    console.error("Error fetching archived data:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
