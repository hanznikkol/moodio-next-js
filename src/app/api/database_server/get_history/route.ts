import { supabaseAdmin } from "@/lib/supabase/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const spotifyId = searchParams.get("spotifyId");

        if (!spotifyId) {
            return NextResponse.json({ error: "Missing spotify ID" }, { status: 400 });
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("user_id, spotify_id")
            .eq("spotify_id", spotifyId)
            .single();

        if (userError || !user) return NextResponse.json({error: "User not found"}, {status: 404})

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
            .eq("user_id", user.user_id)
            .eq("is_archived", false)
            .order("created_at", { ascending: false, referencedTable: "analyses" }); 
        
        if(error) return NextResponse.json({error: error.message}, {status: 500})

        const formatted = data.map((item: any) => ({
            analyses_id: item.analyses_id,
            is_favorite: item.is_favorite,
            is_archived: item.is_archived,
            latestTime: item.latest_time,
            count: item.count,
            mood: item.analyses?.mood ?? "",
            created_at: item.analyses?.created_at ?? "",
            songs: {
                name: item.analyses?.songs?.name ?? "Unknown",
                artist: item.analyses?.songs?.artist ?? "Unknown"
            }
        }));

        return NextResponse.json(formatted)
    } catch (err: any) {
        console.error("Error in API route:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}