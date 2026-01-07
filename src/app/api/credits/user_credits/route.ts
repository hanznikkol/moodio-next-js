import { DAILY_LIMIT } from "@/lib/config/creditsLimit";
import { getSupabaseClientWithJWT, getUserIdFromJWT } from "@/lib/supabase/supabaseClientHelper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!jwt) throw new Error("Missing JWT");

        const supabaseClientJWT = getSupabaseClientWithJWT(jwt);
        const userId = await getUserIdFromJWT(jwt);

        const today = new Date().toISOString().split("T")[0]
        
        const { data: creditData, error: creditError } = await supabaseClientJWT
            .from("daily_user_credits")
            .select("*")
            .eq("user_id", userId)
            .eq("used_on", today)
            .single();

        if (creditError && creditError.code !== "PGRST116") throw creditError;

        let usedCount = 0

        if (!creditData) {
        // Create row for old users
            const { error: insertError } = await supabaseClientJWT
                .from("daily_user_credits")
                .insert({
                    user_id: userId,
                    used_on: today,
                    used_count: 0
                })
                .select("*")
                .single();

            if (insertError) throw insertError;
        } else {
            usedCount = creditData.used_count
        }

        const remainingCredits = Math.max(DAILY_LIMIT - usedCount, 0)

        return NextResponse.json({ remainingCredits });
    } catch (err: unknown) {
        let message = "Server error";
        if (err instanceof Error) message = err.message;

        console.error("Error fetching user credits:", err);
        return NextResponse.json({ error: message }, { status: 500 });
    } 
}