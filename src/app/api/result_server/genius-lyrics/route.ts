import axios from "axios"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const title = url.searchParams.get("title")
        const artist = url.searchParams.get("artist")

        if (!title || !artist) return NextResponse.json({error: "Missing title or artist"}, {status: 400})

        const response = await axios.get(`https://api.genius.com/search`, {
            headers: {
                Authorization: `Bearer ${process.env.GENIUS_CLIENT_ACCESS_TOKEN}`
            }, 
            params: {
                q: `${artist} ${title}`
            }
        })

        const song = response.data.response.hits?.[0]?.result 

        return NextResponse.json({url: song?.url ?? null})
    } catch (err) {
        console.error("Error fetching Genius URL:", err);
        return NextResponse.json(
            { url: null, error: "Failed to fetch Genius URL" },
            { status: 500 }
        );
    }
}