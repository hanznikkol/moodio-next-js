import axios from "axios";

export async function POST(req: Request) {
    const { refreshToken } = await req.json();
    if (!refreshToken) return new Response("Missing refresh token", { status: 400 });

    try {
        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI! ?? ""
        });
        const response = await axios.post("https://accounts.spotify.com/api/token", body.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64")
            },
        });

        const data = response.data;

        if (!data.access_token) return new Response("Failed to refresh token", { status: 500 });

        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        console.error("Spotify token refresh failed:", error);
        return new Response("Failed to refresh token", { status: 500 });
    } 
}