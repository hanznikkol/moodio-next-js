import axios from "axios";

export async function fetchUserCredits(supabaseJWT: string): Promise<number | null> {
    try {
        const res = await axios.get("/api/credits/user_credits", {
            headers: {
                Authorization: `Bearer ${supabaseJWT}`
            }
        })

        const data = res.data
        if (data.remainingCredits !== undefined) {
            return data.remainingCredits;
        }
        
        return null
    } catch(err: any) {
        console.error("Failed to fetch user credits:", err);
        return null;
    }
}