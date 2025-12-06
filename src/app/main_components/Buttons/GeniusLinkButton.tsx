import { AnalysisResult } from '@/lib/analysisMoodLib/analysisResult';
import React, { useMemo } from 'react'
import { SiGenius } from "react-icons/si";

interface GeniusLinkButtonProps {
  trackName?: string | null;
  trackArtist?: string | null;
  analysis?: AnalysisResult | null; 
}

function GeniusLinkButton({trackName, trackArtist, analysis}: GeniusLinkButtonProps) {
   const lyricsUrl = useMemo(() => {
    if (!trackName || !trackArtist || !analysis) return undefined;
    return analysis.lyrics ?? undefined;
  }, [trackName, trackArtist, analysis]);
  return (
    <a
      href={lyricsUrl}
      target="_blank"
      rel="noopener noreferrer"
       className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-sm ${
        !lyricsUrl
          ? "opacity-50 pointer-events-none"
          : "text-gray-800 dark:text-white hover:text-purple-500 dark:hover:text-purple-400"
      }`}
    >
      <SiGenius className='w-4 h-4' />
      Lyrics
    </a>
  )
}

export default GeniusLinkButton