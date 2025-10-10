import { Loader2, Music } from "lucide-react";

interface HeaderProps {
  selectedTrackID: string | null;
}

export default function Header({ selectedTrackID }: HeaderProps) {
  return (
    <div className="flex items-center gap-4 flex-col select-none">
      <h1 className="text-6xl font-bold text-white">Moodio</h1>
      {selectedTrackID && (
        <div className="flex items-center gap-2 text-white">
          <Music className="w-5 h-5 text-pink-400" />
          Analyzing your Spotify track
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
    </div>
  );
}
