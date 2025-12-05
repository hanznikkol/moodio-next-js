// eslint-disable-next-line @typescript-eslint/no-explicit-any
import axios from "axios";
import type { AnalysisResult } from "./analysisResult";

const cache = new Map<string, AnalysisResult>();

export async function analyzeMood(artist: string, songTitle: string, spotifyToken?: string, retries = 1): Promise<AnalysisResult> {
  const key = `${artist}:${songTitle}`;

  if (cache.has(key)) {
    return cache.get(key)!;
  }
  
  try {
    const res = await axios.post("/api/analyzeMood", { artist, songTitle, spotifyToken });
    const data = res.data as AnalysisResult
    cache.set(key, data)
    return res.data;

  } catch (error: any){
    if (error.response?.status === 503 && retries > 0) {
      console.warn("API overloaded. Retrying in 5s...");
      await new Promise((r) => setTimeout(r, 5000));
      return analyzeMood(artist, songTitle, spotifyToken, retries - 1);
    }
    console.error("Error analyzing mood:", error);
    throw error;
  }
}