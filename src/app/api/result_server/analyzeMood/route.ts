import { NextResponse } from "next/server";
import { analyzeMoodServer } from "@/lib/analysisMoodLib/analysisMoodHelperServer";

export async function POST(req: Request) {
  try {
    const {artist, songTitle, spotifyToken} = await req.json();

    if (!artist || !songTitle) {
      return NextResponse.json({ error: "Artist and song title are required" }, { status: 400 });
    }

    const analysis = await analyzeMoodServer(artist, songTitle, spotifyToken);

    if (!analysis) {
      return NextResponse.json({ error: "Analysis unavailable. AI might be busy." }, { status: 503 });
    }

    return NextResponse.json(analysis, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
