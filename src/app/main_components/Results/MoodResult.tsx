"use client"
import React from "react";
import { AnalysisResult } from "@/lib/analysisResult";

interface MoodResultProps {
  analysis: AnalysisResult;
}

export default function MoodResult({ analysis }: MoodResultProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md my-4 text-white">
      {/* Header */}
      <div className="w-full h-px bg-white/20 mb-2"></div>
      <p className="text-sm uppercase tracking-wide opacity-80 select-none">
        Mood Analysis Result
      </p>

      {/* Mood */}
      <h2 className="text-2xl font-bold mt-4">{analysis.mood}</h2>
      <p className="text-sm mt-2 text-center">{analysis.explanation}</p>

      {/* Color Palette */}
      {
        analysis?.colorPalette?.length > 0 && (
          <div className="flex gap-2 mt-4 justify-evenly">
          {analysis.colorPalette.map((color) => (
            <div
              key={color}
              style={{ backgroundColor: color }}
              className="w-8 h-8 rounded"
            />
          ))}
          </div>
        )
      }
      

      {/* Recommended Tracks */}
      {analysis.recommendedTracks.length > 0 && (
        <div className="mt-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Recommended Tracks</h3>
          <ul className="flex flex-col gap-2">
            {analysis.recommendedTracks.map((track) => (
              <li key={track.id || track.name} className="text-sm">
                {track.name} — {track.artist}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional: Spotify link */}
      {analysis.spotifyTrackId && (
        <a
          href={`https://open.spotify.com/track/${analysis.spotifyTrackId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-blue-400 underline"
        >
          Open in Spotify
        </a>
      )}
    </div>
  );
}
