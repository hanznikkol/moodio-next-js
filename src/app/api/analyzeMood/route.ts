import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
     try {
          const { artist, songTitle } = await req.json();
          const prompt = `
               You are a music analysis expert with 100% percent accuracy. Analyze the following song and return a JSON strictly following this schema:
               {
                    "mood": string,
                    "explanation": string,
                    "colorPalette": string[],
                    "spotifyTrackId": string?,
                    "lyrics": string?,
                    "recommendedTracks": [
                              { "id": string?, "name": string, "artist": string, "note": string?, "image": string?, "uri": string? }
                         ]
               }
               Song Title: "${songTitle}"
               Artist: "${artist}"

               Instructions:
               - Respond **only with valid JSON**, no extra text.
               - Return a **single-line JSON string**.
               - Escape quotes inside strings as (\").
               - Replace all line breaks in strings (especially lyrics) with \n.
               - Mood: 1-2 descriptive words combined (e.g., "Calm and reflective").
               - Explanation: 2-3 sentences describing genre, melody, lyrics, and overall vibe.
               - Lyrics: provide full exact lyrics if available; otherwise, return null. Do not invent lyrics.
               - ColorPalette: 3-5 hex colors **directly extracted from the album art or single cover**. 
               If exact album art colors are unavailable, pick colors that strongly reflect the album's cover image, not just the mood.
               - RecommendedTracks: match mood/style; all fields must be single-line strings.
               - Consider lyrics, tempo, melody, artist style, and genre.
               - Use multiple sources if needed.
          `;

          const response = await ai.models.generateContent({
               model: 'gemini-2.0-flash',
               contents: [prompt],
               config: {
                    maxOutputTokens: 1200,
                    temperature: 0.7,
               }
          });

          const part = response.candidates?.[0]?.content?.parts?.[0];
          const rawText = part?.text?.trim();
          if (!rawText) throw new Error("No response from AI");

          // remove markdown code fences if present
          const jsonMessage = rawText
               .replace(/^```json\s*/i, '') 
               .replace(/^```\s*/i, '')       
               .replace(/```$/i, '')
               .trim();
                        
          if (!jsonMessage) throw new Error("No response from AI");

          console.log("AI Response:", jsonMessage);

          const analysis = JSON.parse(jsonMessage);
          return NextResponse.json(analysis);
          
     } catch (error) {
          console.error("Error: ", error);
          return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
     }
}
