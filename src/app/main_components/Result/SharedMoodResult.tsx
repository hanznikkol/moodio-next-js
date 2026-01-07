"use client"
import React from "react";
import { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RecommendedTracksList from "./ResultComponents/RecommendedTracksList";
import ColorPaletteComponent from "./ResultComponents/ColorPaletteComponent";

interface SharedMoodResultProps {
  analysis: AnalysisResult;
}

export default function SharedMoodResult({ analysis }: SharedMoodResultProps) {
  const palettes = analysis?.colorPalette || []

  return (
    <Card className="w-full max-w-md lg:max-w-md  text-black dark:text-white bg-gray-50/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl duration-200">
      <CardHeader>
          <CardTitle 
              style={{
                textShadow: palettes.length
                  ? `0 0 8px ${palettes[0]}, 0 0 16px ${palettes[0]}55`
                  : "0 0 8px rgba(255,255,255,0.3)",
              }}
            className="text-3xl md:text-4xl font-bold lg:font-extrabold text-center text-neutral-700 dark:text-white">
            {analysis.mood || "Unknown"}  
          </CardTitle>
      </CardHeader>

      <Separator className=" bg-gray-200 dark:bg-white/20"/>

      <CardContent className="flex flex-col gap-6 justify-center">
        {/* Mood */}
        <p className="text-sm text-center">{analysis.explanation || "No explanation available"}</p>
        
        {/* Color Palette */}
        {analysis?.colorPalette?.length > 0 && <ColorPaletteComponent colors={palettes}/>}

        {/* Recommended Tracks */}
        {analysis.recommendedTracks?.length > 0 && (
          <RecommendedTracksList tracks={analysis.recommendedTracks}/>
        )}

    </CardContent>

    </Card>
  );
}
