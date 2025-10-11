'use client'
import { useEffect, useState, useRef } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { MoodScores } from "@/lib/moodTypes";
import axios from "axios";
import LoadingSpinner from "./main_components/LoadingSpinner";
import LogoHeader from "./main_components/LogoHeader";
import MoodResult from "./main_components/Results/MoodResult";
import PlayPrompt from "./main_components/PlayPrompt";
import { SpotifyPlayback } from "@/lib/spotifyTypes";

export default function Home() {
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodScores | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const previousTrackId = useRef<string | null>(null);
  const previousIsPlaying = useRef<boolean>(false);

  // Logging in Spotify
  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      setConnecting(true)
      window.location.href = "/api/spotify/login";
    }
  }
  
  //Get Current Track
  const getCurrentTrack = async (accessToken: string) => {
    try {
      const res = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (res.status === 204) return null; // nothing playing

      const data = res.data as SpotifyPlayback
      return {
          id: data.item.id,
          name: data.item.name,
          artists: data.item.artists.map((a) => a.name).join(", "),
          spotifyUrl: data.item.external_urls.spotify,
          is_playing: data.is_playing
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


  // Fetch Track from Spotify
  useEffect(()=>{
    if (!spotifyToken) return

    const checkPlayback = async () => {
      const res = await getCurrentTrack(spotifyToken);
      if (!res) return;

      // Track change
      if (res.id !== previousTrackId.current) {
        previousTrackId.current = res.id;
        toast.info(`🎵 Now playing: ${res.name} by ${res.artists}`);
        console.log("🎶 New track:", res.name);
        setSelectedTrackID(res.id);
      }

      // Play/Pause change
      if (res.is_playing !== previousIsPlaying.current) {
        previousIsPlaying.current = res.is_playing;
        if (res.is_playing) toast.success("▶️ Playback resumed");
        else toast.warning("⏸️ Playback paused");
      }
    }

    checkPlayback()
    const interval = setInterval(checkPlayback, 3000);
    return () => clearInterval(interval)

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
