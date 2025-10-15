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
        <h1 className="text-6xl font-bold text-white">Moodio</h1>

        {/* Powered By */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span>Powered by Gemini AI</span>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse delay-150" />
        </div>
      </div>

      
      {/* Loading and Song Track */}
      <div className="text-white text-center text-lg select-none flex items-center justify-center gap-2">
        {selectedTrackID ? (
          <>
            {loading ? (
              <>
                <Music className="w-5 h-5 text-green-400" />
                Analyzing your Spotify track... Please wait 🎧
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <Music className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-2xl">{trackName}</span>
                  </div>
    
                  {trackArtist && <span className="opacity-80 text-white">by {trackArtist}</span>}
                </div>
                
              </>
            )}
          </>
        ) : (
          !spotifyToken && (
            <>
              <Music className="w-5 h-5 text-green-400" />
              Connect a Spotify track to see its mood
            </>
          )
        )}
      </div>
    </div>
  );
}
