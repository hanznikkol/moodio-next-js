import axios from "axios";
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const code = searchParams.get("code")
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
    
    //If cancel
    const error = searchParams.get("error");
    if (error === "access_denied" || !code) {
        return NextResponse.redirect(baseUrl);
    }

    try {
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code: code ?? "", // fallback to empty string if null
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI! ?? ""
        });

        const response = await axios.post("https://accounts.spotify.com/api/token",
            body.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: "Basic " + Buffer.from(
                        process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
                    ).toString("base64")
                },
            }
        )

        const data = response.data

        if (!data.access_token) return NextResponse.redirect(baseUrl);
        
        const params = new URLSearchParams({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in
        });

        return NextResponse.redirect(`${baseUrl}/?${params.toString()}`);

    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error("Spotify token exchange failed:", error.response?.data || error.message);
        } else if (error instanceof Error) {
            console.error("Spotify token exchange failed:", error.message);
        } else {
            console.error("Spotify token exchange failed: Unknown error");
        }
        return NextResponse.redirect(baseUrl);
    }
}