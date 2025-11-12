import { Loader2, Music, Sparkles } from "lucide-react";
import { MoodioLogo } from "../svg/moodio_logo";

interface HeaderProps {
  selectedTrackID: string | null;
  spotifyToken: string | null;
  loading: boolean;
  trackName?: string | null;
  trackArtist?: string | null;
}

export default function LogoHeader({
  selectedTrackID,
  spotifyToken,
  loading,
  trackName,
  trackArtist,
}: HeaderProps) {
  return (
    <div className="flex items-center gap-4 flex-col select-none">
      {/* Moodio */}
      <div className="flex flex-col items-center gap-2">
        <MoodioLogo className="w-52 md:w-72 lg:w-96"/>
      </div>  
      
      {/* Loading and Song Track */}
      <div className="text-center flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base md:text-lg">
        {selectedTrackID ? (
          <>
            {loading ? (
              <>
                <div className="flex gap-4">
                  <Music className="w-5 h-5 text-green-400" />
                  <p className="text-sm md:text-base text-black dark:text-white">Analyzing your Spotify track... Please wait 🎧</p>
                  <Loader2 className="w-5 h-5 text-black dark:text-white animate-spin" />
                </div>
                
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {/* Track Name */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Music className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-black dark:text-white text-base sm:text-xl md:text-2xl truncate max-w-xs sm:max-w-sm md:max-w-md">
                      {trackName}
                    </span>
                    <Music className="w-5 h-5 text-green-400" />
                  </div>
                  {/* Track Artist */}
                  {trackArtist && (
                    <span className="opacity-80 text-black dark:text-white text-sm sm:text-base truncate max-w-xs sm:max-w-sm md:max-w-md">
                      by {trackArtist}
                    </span>
                  )}
                </div>
                
              </>
            )}
          </>
        ) : (
          !spotifyToken && (
            <>
              <div className="flex gap-2">
                <Music className="w-5 h-5 text-green-400" />
                <p className="text-sm lg:text-base text-black dark:text-white">Connect a Spotify track to see its mood</p>
              </div>
             
            </>
          )
        )}
      </div>
    </div>
  );
}
