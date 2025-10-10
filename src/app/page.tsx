'use client'
import { useEffect, useState } from "react";
import MoodBars from "./main_components/Results/sub_component/MoodBars";
import Recommendation from "./main_components/Results/sub_component/Recommendation";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { MoodScores } from "@/lib/moodTypes";
import { Loader2, Music } from "lucide-react";
import axios from "axios";
import LoadingSpinner from "./main_components/LoadingSpinner";
import Header from "./main_components/Header";
import MoodResult from "./main_components/Results/MoodResult";

export default function Home() {
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodScores | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Logging in Spotify
  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      setConnecting(true)
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
      setShowPrompt(true)
      
      toast.success("Spotify connected successfully!")

      window.history.replaceState({}, document.title, "/")
    }
  }, [])

  const openSpotify = () => window.open("https://open.spotify.com", "_blank")

  return (
    <div className="flex flex-col items-center p-8 w-full gap-8">
      {/* Header */}
      <Header selectedTrackID={selectedTrackID}/>

      {/* Spotify Button */}
      {!selectedTrackID && !spotifyToken && !connecting && <SpotifyButton onClick={handleSpotifyClick} />}

      {/* Connecting state */}
      {loading && !selectedTrackID && !spotifyToken && <LoadingSpinner message="Connecting to Spotify"/>}

      {/* Play song from spotify */}
      {showPrompt && !selectedTrackID && (
        <div className="flex flex-col items-center justify-center gap-4 mt-8 text-white text-center p-4 rounded-lg">
          <p className="text-lg mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
            Please play something on Spotify to track mood
          </p>
          <SpotifyButton
            onClick={openSpotify}
            label="Open Spotify & Play Music"
          />    
        </div>
      )}

      {/* Analyzing State */}
      {loading && <LoadingSpinner message="Analyzing... Please wait!" />}

      {/* Mood Analysis Results */}
      {!loading && selectedTrackID && showResults && moodAnalysis && <MoodResult analysis={moodAnalysis}/>}

    </div>
  );
}
