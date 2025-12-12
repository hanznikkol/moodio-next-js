// eslint-disable-next-line @typescript-eslint/no-explicit-any
import axios from "axios";
import type { AnalysisResult } from "./analysisResult";
import { toast } from "sonner";

const cache = new Map<string, AnalysisResult>();

export async function analyzeMood(artist: string, songTitle: string, spotifyToken?: string): Promise<AnalysisResult & { remainingCredits?: number }> {
  const key = `${artist}:${songTitle}`;

  if (cache.has(key)) {
    const cachedAnalysis = cache.get(key)!;
    return { ...cachedAnalysis }; // remainingCredits will be fetched from API
  }
  
  try {
    const res = await axios.post("/api/result_server/analyzeMood", { artist, songTitle, spotifyToken });
    const data = res.data as AnalysisResult & { remainingCredits?: number };
    cache.set(key, { ...data });
    return data;

  } catch (error: any){
    if (error.response?.status === 503) {
      toast.warning("AI server is busy. Please try again later.");
      throw new Error("AI server is busy. Please try again later.");
    }
    if (error.response?.status === 429) {
      toast.error(error.response.data?.error || "Daily credit limit reached.");
      return { remainingCredits: error.response.data?.remainingCredits ?? 0 } as any;
    }

    console.error("Error analyzing mood:", error);
    throw error;
  }
}