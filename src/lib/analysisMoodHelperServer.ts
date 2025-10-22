/* eslint-disable @typescript-eslint/no-explicit-any */
import json5 from "json5";
import { AnalysisResult } from "./analysisResult";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

//Retry helper
async function retry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
     try {
      return await fn();
     } catch (err){
      lastError = err;
      console.warn(`Retry ${i + 1} failed:`, err);
      if (i < retries) await new Promise(r => setTimeout(r, delayMs));
     }
  }
  throw lastError
}

//Fetch lyrics
async function fetchLyrics(artist: string, songTitle: string): Promise<string | null> {
  const prompt = `
    Find the complete and official lyrics for the song "${songTitle}" by "${artist}". 
    If you cannot find them from a reliable public source, return null.
    Respond ONLY with JSON: { "lyrics": string|null }.
    Do NOT invent or approximate lyrics. If unsure, return null exactly.
  `;

  const result = await retry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [prompt],
      config: { maxOutputTokens: 1500, temperature: 0 }
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) throw new Error("No AI response for lyrics");

    // Remove code fences if present
    const jsonText = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(jsonText);
    return data.lyrics ?? null;
  })

  return result
}

//Core analyze
async function analyzeSongCore(
  artist: string,
  songTitle: string,
  lyrics: string | null
): Promise<Omit<AnalysisResult, "lyrics">> {
  const prompt = `
    Analyze the song "${songTitle}" by "${artist}".
    Lyrics: ${lyrics ? `"${lyrics.replace(/\n/g, "\\n")}"` : "null"}
    Return JSON following this schema:
    {
      "mood": string,
      "explanation": string,
      "colorPalette": string[],
      "spotifyTrackId": string|null,
      "recommendedTracks": [
        { "id": string|null, "name": string, "artist": string, "note": string|null, "image": string|null, "uri": string|null }
      ]
    }
    Rules:
    - Return ONLY valid JSON, no extra text.
    - Limit recommendedTracks to 3 unique items.
    - Use double quotes for all strings.
    - colorPalette must be in Hex code.
    - If a field is unavailable, return null.
  `;

  const result = await retry(async () => {
      const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [prompt],
      config: { maxOutputTokens: 1500, temperature: 0.7 }
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) throw new Error("No AI response for song analysis");
    console.log("Raw: ", raw)

    const jsonText = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(jsonText);

    // Ensure recommendedTracks are unique by name and artist
    if (Array.isArray(data.recommendedTracks)) {
      const seen = new Set();
      data.recommendedTracks = data.recommendedTracks.filter((t: any) => {
        const key = `${t.name}-${t.artist}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 3);
    }

    console.log("Response: ", data)
    return data
  })

  return result
}

// Main
export async function analyzeMoodServer(artist: string, songTitle: string): Promise<AnalysisResult | null> {
  if (!artist || !songTitle) return null;

  try {
    const lyrics = await fetchLyrics(artist, songTitle);
    const coreData = await analyzeSongCore(artist, songTitle, lyrics);

    return { ...coreData, lyrics };
  } catch (error) {
    console.error("Error analyzing mood:", error);
    return null;
  }
}