"use client"
import React from "react";
import { AnalysisResult } from "@/lib/analysisResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MoodResultProps {
  analysis: AnalysisResult;
}

// function safeBase64Decode(str?: string){
//   if(!str) return null
//   try {
//     return atob(str);
//   } catch {
//     console.warn("Invalid Base64 lyrics");
//     return "Lyrics unavailable";
//   }
// }

export default function MoodResult({ analysis }: MoodResultProps) {

//  const decodedLyrics = analysis.lyrics || "No lyrics available";

  return (
    <Card className="w-full max-w-md text-white bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl ">
      <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {analysis.mood || "Unknown"}
          </CardTitle>
      </CardHeader>

      <Separator className=" bg-white/20"/>

      <CardContent className="flex flex-col gap-6 justify-center">
      {/* Mood */}
      <p className="text-sm text-center">{analysis.explanation || "No explanation available"}</p>

      {/* Color Palette */}
      {analysis?.colorPalette?.length > 0 && (
          <div className="flex gap-2 justify-center">
            {analysis.colorPalette.map((color) => (
              <div
                key={color}
                style={{ backgroundColor: color }}
                className="w-8 h-8 rounded-md shadow-sm border border-white/20"
              />
            ))}
          </div>
        )
      }
{/* 
      <div className="flex flex-col w-full max-w-md">
        <label className="text-xs font-semibold text-white/70 mb-1 uppercase tracking-wide">
          Lyrics
        </label>
        <div className="font-serif p-4 max-h-48 overflow-y-auto bg-white/5 rounded-md whitespace-pre-wrap text-sm text-white/90">
          {decodedLyrics}
        </div>
      </div>
 */}

      {/* Recommended Tracks */}
      {analysis.recommendedTracks?.length > 0 && (
        <div className=" w-full">
          <h3 className="text-lg font-semibold mb-2 text-center">Recommended Tracks</h3>
          <ul className="flex flex-col gap-2">
            {analysis.recommendedTracks.map((track) => (
              <li key={track.id || track.name} className="text-sm">
                {track.name} — {track.artist}
              </li>
            ))}
          </ul>
        </div>
      )}
      </CardContent>

    </Card>
  );
}
