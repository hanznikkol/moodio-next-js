import { Loader2, Music, Sparkles } from "lucide-react";

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
      {/* Logo and Powered */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-6xl font-bold text-black dark:text-white duration-200">Moodio</h1>
      </div>  

      
      {/* Loading and Song Track */}
      <div className="text-white text-center text-lg select-none flex items-center justify-center gap-2">
        {selectedTrackID ? (
          <>
            {loading ? (
              <>
                <Music className="w-5 h-5 text-green-400" />
                <p className="text-black dark:text-white">Analyzing your Spotify track... Please wait 🎧</p>
                <Loader2 className="w-5 h-5 text-black dark:text-white animate-spin" />
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <Music className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-black dark:text-white text-2xl">{trackName}</span>
                    <Music className="w-5 h-5 text-green-400" />
                  </div>
    
                  {trackArtist && <span className="opacity-80 text-black dark:text-white">by {trackArtist}</span>}
                </div>
                
              </>
            )}
          </>
        ) : (
          !spotifyToken && (
            <>
              <Music className="w-5 h-5 text-green-400" />
              <p className="text-black dark:text-white">Connect a Spotify track to see its mood</p>
            </>
          )
        )}
      </div>
    </div>
  );
}
