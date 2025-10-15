import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
     try {
          const { artist, songTitle } = await req.json();
          const prompt = `
               You are a music analysis expert. Analyze the following song and return a JSON strictly following this schema:
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
               - Respond **only** with a valid JSON object.
               - Include **one or two moods combined into a single descriptive string** (e.g., "Calm and reflective").
               - Always include a **colorPalette** field with **hex color codes** that match the mood.
               - Do **not** include explanations or extra text outside the JSON.
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
               .replace(/^```json\s*/i, '')   // remove starting ```json (case insensitive)
               .replace(/^```\s*/i, '')       // or just ```
               .replace(/```$/i, '')          // remove ending ```
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
