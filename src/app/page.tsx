'use client'
import { useEffect, useState } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { MoodScores } from "@/lib/moodTypes";
import axios from "axios";
import LoadingSpinner from "./main_components/LoadingSpinner";
import LogoHeader from "./main_components/LogoHeader";
import MoodResult from "./main_components/Results/MoodResult";
import PlayPrompt from "./main_components/PlayPrompt";
import { SpotifyTrack } from "@/lib/spotifyTypes";

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
  
  const getCurrentTrack = async (accessToken: string) => {
    try {
      const res = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (res.status === 204) return null; // nothing playing

      const data = res.data as {item: SpotifyTrack}
      return {
          id: data.item.id,
          name: data.item.name,
          artists: data.item.artists.map((a) => a.name).join(", "),
          spotifyUrl: data.item.external_urls.spotify,
      }
    } catch (err) {
        console.error("Error fetching current track:", err);
        toast.error("Error fetching current track!")
        return null;  
    }
  }

  // Spotify Mood Analyzer
  const spotifyTrackAnalyzer = async (trackID: string) => {
    setLoading(true);
    setShowResults(false);
    setMoodAnalysis(null);
    setShowPrompt(false)
  };

  // Handle Spotify login redirect and save token
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

  useEffect(()=>{
    if (!spotifyToken) return

    const fetchTrack = async () => {
      const track = await getCurrentTrack(spotifyToken)
      if (track) {
        toast.info(`Current track: ${track.name} by ${track.artists}`);
        console.log("Current track:", track);
        setSelectedTrackID(track.id);
      }
      else {
        toast.warning("No track is currently playing!");
      }
    }

    fetchTrack()
  }, [spotifyToken])


  return (
    <div className="flex flex-col items-center p-8 w-full gap-8">
      {/* Header */}
      <LogoHeader selectedTrackID={selectedTrackID} spotifyToken={spotifyToken}/>

      {/* Spotify Button */}
      {!selectedTrackID && !spotifyToken && !connecting && <SpotifyButton onClick={handleSpotifyClick} />}

      {/* Connecting state */}
      {connecting && !selectedTrackID && !spotifyToken && <LoadingSpinner message="Connecting to Spotify"/>}

      {/* Play song from spotify */}
      {showPrompt && !selectedTrackID && <PlayPrompt/>}

      {/* Analyzing State */}
      {loading && <LoadingSpinner message="Analyzing... Please wait!" />}

      {/* Mood Analysis Results */}
      {!loading && selectedTrackID && showResults && moodAnalysis && <MoodResult analysis={moodAnalysis}/>}

    </div>
  );
}
