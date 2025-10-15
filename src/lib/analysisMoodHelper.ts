import axios from "axios";
import { AnalysisResult } from "./analysisResult";

export async function analyzeMood(artist: string, songTitle: string): Promise<AnalysisResult> {
  try {
      const response = await axios.post('/api/analyzeMood', 
      { artist, songTitle });

    return response.data;
  } catch (error) {
    console.error("Error analyzing mood:", error);
    throw error;
  }
}