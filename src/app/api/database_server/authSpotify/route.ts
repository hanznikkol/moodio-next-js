import { supabaseAdmin } from "@/lib/supabase/supabaseServer";
import * as jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {spotifyId, displayName, avatarUrl} = await req.json()

    const {data: user, error} = await supabaseAdmin
        .from("users")
        .upsert({
            spotify_id: spotifyId,
            display_name: displayName,
            avatar_url: avatarUrl || null,
        }, { onConflict: "spotify_id" })
        .select()
        .single()

    if (error || !user) return NextResponse.json({ error: error?.message || "Failed to upsert user" }, { status: 500 });

    //Create Token
    const token = jwt.sign(
        {sub: user.user_id}, 
        process.env.SUPABASE_JWT_SECRET!,
        {expiresIn: "1h"}
    )

    return NextResponse.json({token})
}