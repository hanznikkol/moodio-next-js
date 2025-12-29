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

export async function consumeCredits(supabaseJWT: string): Promise<number> {
    try {
        const res = await axios.post("/api/credits/consume_credits", {}, {
            headers: {
                Authorization: `Bearer ${supabaseJWT}`
            }
        })

        console.log("consumeCredits response", res.data);

        if (res.data?.remainingCredits === undefined) {
            throw new Error("Invalid response from server");
        }

        return res.data.remainingCredits;
    } catch(err) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          throw new Error("Daily credit limit");
        } 
        throw err
    }
}