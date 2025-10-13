import { Loader2, Music } from "lucide-react";

interface HeaderProps {
  selectedTrackID: string | null;
  spotifyToken: string | null
  loading: boolean;
}

export default function LogoHeader({ selectedTrackID, spotifyToken, loading }: HeaderProps) {
  return (
    <div className="flex items-center gap-4 flex-col select-none">
      <h1 className="text-6xl font-bold text-white">Moodio</h1>

      <p className="text-white text-center text-lg select-none flex items-center justify-center gap-2">
        {selectedTrackID ? (
          <>
            <Music className="w-5 h-5 text-pink-400" />
            {loading ? (
              <>
                Analyzing your Spotify track... Please wait 🎧
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </>
            ) : (
              "Track detected! Showing results soon..."
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
      </p>
    </div>
  );
}
