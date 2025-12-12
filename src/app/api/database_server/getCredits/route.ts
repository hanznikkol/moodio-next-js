import { NextResponse } from "next/server";
import { canUseCredit } from "@/lib/analysisMoodLib/credits";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ credits: 0 });

    const { credits } = await canUseCredit(userId);
    return NextResponse.json({ credits });
  } catch (err: any) {
    console.error("Credits fetch error:", err);
    return NextResponse.json({ credits: 0 });
  }
}
