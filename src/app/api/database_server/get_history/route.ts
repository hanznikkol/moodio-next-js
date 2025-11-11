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
            users (
            spotify_id
            )
        `)
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false });
        
        if(error) return NextResponse.json({error: error.message}, {status: 500})
        console.log(data)
        return NextResponse.json(data)
    } catch (err: any) {
        console.error("Error in API route:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}