import { NextResponse } from "next/server";
import { analyzeMoodServer } from "@/lib/analysisMoodLib/analysisMoodHelperServer";
import { canUseCredit, useCredit } from "@/lib/analysisMoodLib/credits";

export async function POST(req: Request) {
  try {
    const {userId, artist, songTitle, spotifyToken} = await req.json();

    if (!artist || !songTitle) {
      return NextResponse.json({ error: "Artist and song title are required" }, { status: 400 });
    }

    const creditCheck = await canUseCredit(userId)
    if (!creditCheck.allowed) {
      return NextResponse.json({
        error: `Daily limit reached. You have ${creditCheck.credits} credits left.`,
      }, { status: 429 });
    }

    const analysis = await analyzeMoodServer(artist, songTitle, spotifyToken);

    const remainingCredits = await useCredit(userId);

    if (!analysis) {
      return NextResponse.json({ error: "Analysis unavailable. AI might be busy." }, { status: 503 });
    }

    return NextResponse.json({ ...analysis, remainingCredits: remainingCredits }, { status: 200 });
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
