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

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code ?? "", // fallback to empty string if null
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI ?? ""
    });

    const response = await fetch("https://accounts.spotify.com/api/token", 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64")
            },
            body,
        }
    )

    const data = await response.json()
    if (!data.access_token) {
        return NextResponse.redirect("/");
    }

    // For now, redirect back to homepage with access token in query (simple for testing)
    return NextResponse.redirect(`${baseUrl}/?access_token=${data.access_token}`);
}