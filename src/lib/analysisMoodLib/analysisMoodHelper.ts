// eslint-disable-next-line @typescript-eslint/no-explicit-any
import axios from "axios";
import type { AnalysisResult } from "./analysisResult";
import { toast } from "sonner";

const cache = new Map<string, AnalysisResult>();

export async function analyzeMood(artist: string, songTitle: string, spotifyToken?: string): Promise<AnalysisResult> {
  const key = `${artist}:${songTitle}`;

  if (cache.has(key)) {
    return cache.get(key)!;
  }
  
  try {
    const res = await axios.post("/api/result_server/analyzeMood", { artist, songTitle, spotifyToken });
    const data = res.data as AnalysisResult
    cache.set(key, data)
    return data;

  } catch (error: any){
    if (error.response?.status === 503) {
      toast.warning("AI server is busy. Please try again later.");
      throw new Error("AI server is busy. Please try again later.");
    }
    if (error.response?.status === 429) {
      toast.error("Rate limit exceeded. Please wait before trying again.");
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    console.error("Error analyzing mood:", error);
    throw error;
  }
}