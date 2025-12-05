"use client"
import React from "react";
import { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Music } from "lucide-react";
import { FaFacebookMessenger, FaFacebookSquare, FaInstagram, FaSpotify } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CopyClipboard from "../Icons/CopyClipboard";
import SpotifyLinkButton from "../Buttons/SpotifyLinkButton";
import { cn } from "@/lib/utils";

interface MoodResultProps {
  analysis: AnalysisResult;
}

export default function MoodResult({ analysis }: MoodResultProps) {
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
        {analysis?.colorPalette?.length > 0 && (
          <TooltipProvider>
            <div className="flex flex-wrap gap-2 justify-center">
              {analysis.colorPalette.map((color) => (
                <Tooltip key={color}>
                  <TooltipTrigger asChild>
                    <div
                      style={{ backgroundColor: color }}
                      className="w-8 h-8 rounded-md shadow-sm border border-gray-300 dark:border-white/20 cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}

        {/* Recommended Tracks */}
        {analysis.recommendedTracks?.length > 0 && (
          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold mb-3 text-center">Top Recommended Tracks</h3>

            {/* Recommended List */}
            <div className="bg-gray-100 dark:bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-sm"> 
              <div>
                <ul className="flex flex-col gap-2">
                  {analysis.recommendedTracks.slice(0, 5).map((track, index, arr) => (
                    <li key={track.id || track.name}
                        className={cn("flex items-center gap-3 p-3 transition-colors",
                          index !== arr.length - 1 && "border-b border-black/10 dark:border-white/10"
                        )}
                    >
                      {/* Album */}
                      {track.image ? (
                        <Image
                          src={track.image}
                          alt={track.name}
                          width = {48}
                          height={48}
                          className="rounded-md object-cover flex-shrink-0"
                          priority={false}
                        />
                      ) : (
                        <div className="w-9 h-9 sm:w-12 sm:h-12  rounded-md bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Music className="w-6 h-6 text-gray-500 dark:text-white/50" />
                        </div>
                      )}

                      {/* Track Info */}
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">{track.name}</span>
                        <span className="text-xs text-gray-600 dark:text-white/70 truncate">{track.artist}</span>
                      </div>
                      
                      {/* Recommendation Spotify Links */}
                      <SpotifyLinkButton
                        trackUri= {track.uri}
                        trackName= {track.name}
                        trackArtist={track.artist}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Share with friends */}
        <div className="w-full"> 
          <h3 className="text-lg font-semibold mb-3 text-center">Share it with your friends</h3>
          
          <div className="flex justify-center gap-8 items-center text-2xl">
            <FaFacebookSquare className="text-[#1877F2] hover:scale-110 transition-transform cursor-pointer" />
            <FaFacebookMessenger className="text-[#0084FF] hover:scale-110 transition-transform cursor-pointer" />
            <FaInstagram className="text-[#E1306C] hover:scale-110 transition-transform cursor-pointer" />
            <FaSquareXTwitter className="text-black dark:text-white hover:scale-110 transition-transform cursor-pointer"/>
            <CopyClipboard textToCopy=""/>
          </div>

        </div>

    </CardContent>

    </Card>
  );
}
