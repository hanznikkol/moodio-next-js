import axios from "axios";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseServer";
import * as jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";

  if (!code || searchParams.get("error") === "access_denied") {
    return NextResponse.redirect(baseUrl);
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
    });

    const response = await axios.post("https://accounts.spotify.com/api/token",
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64")
        }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    if (!access_token) return NextResponse.redirect(baseUrl);

    // fetch user profile
    const profileRes = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const profile = profileRes.data;

    // upsert user in Supabase
    const { data: user } = await supabaseAdmin
      .from("users")
      .upsert({
        spotify_id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.images?.[0]?.url || null,
      }, { onConflict: "spotify_id" })
      .select()
      .single();

    // generate app JWT
    const appJwt = jwt.sign(
      { sub: user.user_id },
      process.env.SUPABASE_JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const params = new URLSearchParams({
      access_token,
      refresh_token,
      expires_in: expires_in.toString(),
      app_jwt: appJwt
    });

    return NextResponse.redirect(`${baseUrl}/?${params.toString()}`);

  } catch (err) {
    console.error("Spotify callback error:", err);
    return NextResponse.redirect(baseUrl);
  }
}
