import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
    const scope = ["user-read-private", "user-read-playback-state", "user-read-currently-playing", "user-top-read"].join(" ")

    const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return NextResponse.redirect(authURL)
}