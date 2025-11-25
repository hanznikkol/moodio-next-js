/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalysisResult, RecommendedTrack } from "./analysisResult";
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

// Search Spotify track to get a working URI
async function searchSpotifyTrack(name: string, artist: string, token: string): Promise<string | null> {
  const query = encodeURIComponent(`${name} ${artist}`);
  const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.tracks?.items?.length > 0) {
    return data.tracks.items[0].external_urls.spotify;
  }
  return null;
}

//Core analyze
async function analyzeSongCore(artist: string, songTitle: string): Promise<Omit<AnalysisResult, "lyrics">> {
  
  const prompt = `
    Analyze the song "${songTitle}" by "${artist}".
    Return JSON following this schema:
    {
      "mood": string,
      "explanation": string,
      "colorPalette": string[],
      "spotifyTrackId": string|null,
      "recommendedTracks": [
        { "id": string|null, "name": string, "artist": string, "note": string|null }
      ]
    }
    Rules:
    - Return ONLY valid JSON, no extra text.
    - Mood must be **2 descriptive words**
    - Avoid repeating common moods like "nostalgic" or "melancholic" in every result.
    - Consider **similar genre, tempo, mood, lyrical theme, or instrumentation**.
    - Return exactly 5 (max) tracks that are **musically or emotionally related** to this song.
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
      }).slice(0, 5);
    }

    return data
  })

  return result
}

// Main
export async function analyzeMoodServer(artist: string, songTitle: string, SPOTIFY_ACCESS_TOKEN: string): Promise<AnalysisResult | null> {
  if (!artist || !songTitle) return null;

  try {
    const coreData = await analyzeSongCore(artist, songTitle);

  if (!SPOTIFY_ACCESS_TOKEN) {
    console.warn("Spotify token missing: recommended track URIs may not be fetched.");
  }

    // Verify recommendedTracks URIs with Spotify API
    const recommendedTracksWithUri: RecommendedTrack[] = await Promise.all(
      coreData.recommendedTracks.map(async (track) => {
        const uri = await searchSpotifyTrack(track.name, track.artist, SPOTIFY_ACCESS_TOKEN);
        return { ...track, uri: uri ?? track.uri ?? null };
      })
    );

    return { ...coreData, recommendedTracks: recommendedTracksWithUri };
  } catch (error) {
    console.error("Error analyzing mood:", error);
    return null;
  }
}