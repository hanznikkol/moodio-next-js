'use client'
import { useEffect, useState } from "react";
import MoodBars from "./main_components/MoodBars";
import Recommendation from "./main_components/Recommendation";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { MoodScores } from "@/lib/moodTypes";
import { Loader2, Music } from "lucide-react";
import axios from "axios";

export default function Home() {
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodScores | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Logging in Spotify
  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      window.location.href = "/api/spotify/login";
    }
  }

  // Spotify Mood Analyzer
  const spotifyTrackAnalyzer = async (trackID: string) => {
    setLoading(true);
    setShowResults(false);
    setMoodAnalysis(null);
    setShowPrompt(false)
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("access_token")
    const error = params.get("error")

    if(error) {
      setSpotifyToken(null)
      localStorage.removeItem("spotifyToken")
      window.history.replaceState({}, document.title, "/");
      return;
    }

    if (token) {
      setSpotifyToken(token)
      localStorage.setItem("spotifyToken", token)
      window.history.replaceState({}, document.title, "/")
      setShowPrompt(true)

      toast.success("Spotify connected successfully!")
    }
  }, [])

  return (
    <div className="flex flex-col items-center p-8 w-full gap-8">
      {/* Header */}
      <div className="flex items-center gap-4 flex-col select-none">
        <h1 className="text-6xl font-bold text-white">Moodio</h1>
        <p className="text-white text-center text-lg select-none flex items-center justify-center gap-2">
          {selectedTrackID ? (
            <>
              <Music className="w-5 h-5 text-pink-400" />
              Analyzing your Spotify track
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </>
          ) : (
            <>
              <Music className="w-5 h-5 text-green-400" />
              Connect a Spotify track to see its mood
            </>
          )}
        </p>
      </div>

      {/* Spotify Button */}
      {!selectedTrackID && !spotifyToken && <SpotifyButton onClickConnect={handleSpotifyClick} />}

      {/* Play song from spotify */}
      {showPrompt && !selectedTrackID && (
        <div className="flex flex-col items-center justify-center gap-4 mt-8 text-white text-center p-4 bg-gray-800 rounded-lg">
          <p className="text-lg mb-2"> Please play something on Spotify to track your mood 🎵 </p>
          <button
            onClick={() => window.open("https://open.spotify.com", "_blank")}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition duration-200"
          >
            Open Spotify
          </button>
        </div>
      )}

      {/* Analyzing State */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 mt-8 text-white">
          <div className="w-12 h-12 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing... Please wait!</span>
        </div>
      )}

      {/* Mood Analysis Results */}
      {!loading && selectedTrackID && showResults && moodAnalysis && (
        <>
          <div className="flex flex-col items-center w-full max-w-md my-8">
            <div className="w-full h-px bg-white/20 mb-2"></div>
            <p className="text-white text-sm uppercase tracking-wide opacity-80 select-none">
              Mood Analysis Result
            </p>
          </div>

          <MoodBars analysis={moodAnalysis} />
          <Recommendation />
        </>
      )}

    </div>
  );
}
