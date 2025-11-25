"use client"
import { Loader2, Music, Sparkles } from "lucide-react";
import { MoodioLogo } from "../svg/moodio_logo";

interface HeaderProps {
  selectedTrackID: string | null;
  spotifyToken: string | null;
  loading: boolean;
  trackName?: string | null;
  trackArtist?: string | null;
  historyTrackName?: string | null;
  historyTrackArtist?: string | null;
}

export default function HeroHeader({ selectedTrackID, spotifyToken, loading, trackName, trackArtist, historyTrackName, historyTrackArtist }: HeaderProps) {

  const displayTrack = historyTrackName
  ? { name: historyTrackName, artist: historyTrackArtist }
  : trackName
  ? { name: trackName, artist: trackArtist }
  : null;

  const isAnalyzing = !!selectedTrackID && loading;
  const noTrack = !displayTrack;

  return (
    <div className="flex items-center gap-4 flex-col select-none">
      <div className="flex flex-col items-center gap-2">
        <MoodioLogo className="w-64 md:w-72 lg:w-96"/>
      </div>  

      <div className="text-center flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base md:text-lg justify-center">
        {isAnalyzing && (
          <div className="flex gap-4 justify-center items-center">
            <Music className="w-5 h-5 text-green-400" />
            <p className="text-sm md:text-base text-black dark:text-white">
              Analyzing your Spotify track... 🎧
            </p>
            <Loader2 className="w-5 h-5 text-black dark:text-white animate-spin" />
          </div>
        )}

        {!isAnalyzing && displayTrack && (
          <div className="flex flex-col items-center gap-2 sm:gap-4 justify-center">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {historyTrackName && <Sparkles className="w-5 h-5 text-yellow-400" />}
              {!historyTrackName && <Music className="w-5 h-5 text-green-400" />}
              <span className="font-bold text-black dark:text-white text-base sm:text-xl md:text-2xl truncate max-w-xs sm:max-w-sm md:max-w-md">
                {displayTrack.name}
              </span>
              {!historyTrackName && <Music className="w-5 h-5 text-green-400" />}
            </div>
            {displayTrack.artist && (
              <span className="opacity-80 text-black dark:text-white text-sm sm:text-base truncate max-w-xs sm:max-w-sm md:max-w-md">
                by {displayTrack.artist}
              </span>
            )}
          </div>
        )}

        {noTrack && !spotifyToken && (
          <div className="flex gap-2 justify-center items-center">
            <Music className="w-5 h-5 text-green-400" />
            <p className="text-sm lg:text-base text-black dark:text-white">
              Connect a Spotify track to see its mood
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
