/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { AnalysisResult, RecommendedTrack } from "./analysisResult";
import { GoogleGenAI } from "@google/genai";
import JSON5 from "json5";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

//Get Genius Lyrics
async function fetchGeniusUrl(trackName: string, trackArtist: string): Promise<string | null> {
  try {
    const res = await axios.get(`http://localhost:3000/api/result_server/genius-lyrics`, {
      params: {
        title: trackName,
        artist: trackArtist
      }
    })

    return res.data.url ?? null;
  } catch (err) {
    console.warn("Genius URL fetch failed:", err)
    return null
  }
} 

// Search Spotify track to get a working URI
async function searchSpotifyTrack(
  name: string, 
  artist: string, 
  token: string
): Promise<{uri: string, image: string | null, id: string} | null> {

  const query = encodeURIComponent(`${name} ${artist}`);
  const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (data.tracks?.items?.length > 0) {
    const track = data.tracks.items[0]
    return {
      uri: track.external_urls.spotify,
      image: track.album.images?.[0]?.url ?? null,
      id: track.id
    }
  }
  return null;
}

//Core analyze
async function analyzeSongCore(artist: string, songTitle: string): Promise<Omit<AnalysisResult, "lyrics">> {
  //Prompt for AI
  const prompt = `
    Analyze the song "${songTitle}" by "${artist}".
    Return JSON following this schema:
    {
      "mood": string,
      "explanation": string,
      "colorPalette": string[],
      "spotifyTrackId": string|null,
      "recommendedTracks": [
        { "name": string, "artist": string, "note": string|null }
      ]
    }

    Rules:
    - Return ONLY valid JSON, no extra text.
    - Mood: exactly 2 descriptive words
    - Explanation: max 200 characters, single line, include meaning, history, and reason for mood.
    - Consider **similar genre, tempo, mood, lyrical theme, or instrumentation**.
    - Return exactly 5 (max) tracks that are **musically or emotionally related** to this song.
    - Use double quotes for all strings.
    - For the "note" field in recommendedTracks, write a short note explaining **why it relates and is recommended** to the main track.
    - colorPalette must be in 4 Hex code and must be returned as a single-line array like ["#FFFFFF","#000000","#FF0000",...]
    - If a field is unavailable, return null.
    - Do NOT use double quotes inside string values. If needed, use single quotes or escape them.
    - recommendedTracks.notes must be ≤ 150 characters and a single line.
    - All string values must be on a single line. Do not insert line breaks inside quotes.
    - All string values and arrays must be on a single line. Do not insert line breaks inside quotes or array brackets
  `;

  try {
    //== GEMINI AI RESPONSE ==
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [prompt],
      config: { maxOutputTokens: 2000, temperature: 0.7 }
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) throw new Error("No AI response for song analysis");
    // console.log(raw)

    // clean the raw text
    const jsonText = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    
    let data;
    // Checking in parsed data
    try {
       data = JSON5.parse(jsonText);
    } catch (parseErr) {
      console.error("Failed to parse JSON from GEMINI:", parseErr, "\nRaw response:", raw);
      throw new Error("Malformed AI response, cannot parse JSON");
    }

    // ensure recommendedTracks are unique
    if (Array.isArray(data.recommendedTracks)) {
      const seen = new Set();
      data.recommendedTracks = data.recommendedTracks.filter((t: any) => {
        const key = `${t.name}-${t.artist}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5);
    }

    //console.log(data)
    return data;
  } catch (err) {
    console.error("Error in Analyze Song Core:", err);
    throw err; 
  }
}

// Main
export async function analyzeMoodServer(artist: string, songTitle: string, SPOTIFY_ACCESS_TOKEN: string): Promise<AnalysisResult | null> {
  if (!artist || !songTitle) return null;

  try {
    // AI Analyze Data
    const coreData = await analyzeSongCore(artist, songTitle);
    // Genius Lyrics
    const mainLyricsUrl = await fetchGeniusUrl(songTitle, artist)

    if (!SPOTIFY_ACCESS_TOKEN) {
      console.warn("Spotify token missing: recommended track URIs may not be fetched.");
    }

    // RecommendedTracks URIs with Spotify API
    const recommendedTracksWithUri: RecommendedTrack[] = await Promise.all(
      coreData.recommendedTracks.map(async (track) => {
        const spotifyData = await searchSpotifyTrack(track.name, track.artist, SPOTIFY_ACCESS_TOKEN)
        return {
          ...track,
          uri: spotifyData?.uri ?? track.uri ?? null,
          image: spotifyData?.image ?? track.image ?? null,
        }
      })
    );

    return { ...coreData, lyrics: mainLyricsUrl ?? null , recommendedTracks: recommendedTracksWithUri };
  } catch (error) {
    console.error("Error analyzing mood:", error);
    return null;
  }
}