'use client'
import { useEffect, useState, useRef } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { MoodScores } from "@/lib/moodTypes";
import LoadingSpinner from "./main_components/LoadingSpinner";
import LogoHeader from "./main_components/LogoHeader";
import MoodResult from "./main_components/Results/MoodResult";
import PlayPrompt from "./main_components/PlayPrompt";
import { getCurrentTrack, spotifyTrackAnalyzer } from "@/lib/spotifyHelper";

export default function Home() {
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodScores | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const previousTrackId = useRef<string | null>(null);
  const previousIsPlaying = useRef<boolean>(false);
  const analyzeTimeout = useRef<NodeJS.Timeout | null>(null);
  const analyzedTrack = useRef<Set<string>>(new Set());
  const refreshToken = useRef<string | null>(null);

  // Logging in Spotify
  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      setConnecting(true)
      window.location.href = "/api/spotify/login";
    }
  }

  // Clear Spotify tokens
  const resetAll = () => {
    // Reset all Spotify-related states
    setSpotifyToken(null);
    setRefreshToken(null);
    setSelectedTrackID(null);
    setShowPrompt(false);
    setShowResults(false);
    setMoodAnalysis(null);
    setLoading(false);
    setConnecting(false);

    // Reset refs
    previousTrackId.current = null;
    previousIsPlaying.current = false;
    analyzedTrack.current.clear();
    if (analyzeTimeout.current) {
      clearTimeout(analyzeTimeout.current);
      analyzeTimeout.current = null;
    }

    // Clear from storage
    localStorage.removeItem("spotifyToken");
    localStorage.removeItem("spotifyRefreshToken");
  };

  // Handle Spotify login redirect and save token
  useEffect(() => {
    // Check for existing tokens in localStorage
    const savedToken = localStorage.getItem("spotifyToken");
    const savedRefresh = localStorage.getItem("spotifyRefreshToken");

    if (savedToken) setSpotifyToken(savedToken);
    if (savedRefresh) setRefreshToken(savedRefresh);

    // Check URL params for new tokens
    const params = new URLSearchParams(window.location.search)
    const token = params.get("access_token")
    const refresh = params.get("refresh_token")
    const error = params.get("error")

    if (error) {
      resetAll();
      toast.error('Spotify login failed.');
      return window.history.replaceState({}, document.title, '/');
    }

    if (refresh) {
      setRefreshToken(refresh)
      localStorage.setItem("spotifyRefreshToken", refresh)
    }

    // Success
    if (token) {
      setSpotifyToken(token);
      localStorage.setItem('spotifyToken', token);
      setShowPrompt(true);
      setConnecting(false);
      toast.success('Spotify connected successfully!');
      console.log("Spotify token acquired:", token);
      window.history.replaceState({}, document.title, '/');
    }

  }, [])

useEffect(() => {
  if (!spotifyToken) return;

  const analyzedTracks = analyzedTrack.current;

  const checkPlayback = async () => {
    const track = await getCurrentTrack(spotifyToken);

    if (!track) {
      // Nothing playing
      previousTrackId.current = null;
      setSelectedTrackID(null);
      setShowPrompt(true);
      return;
    }

    const { id, is_playing } = track;

    // New track
    if (id !== previousTrackId.current) {
      previousTrackId.current = id;
      previousIsPlaying.current = is_playing;

      setSelectedTrackID(id); // update UI immediately

      toast.info(`🎵 Now playing: ${track.name} by ${track.artists}`);

      if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);

      if (is_playing && !analyzedTracks.has(id)) {
        analyzeTimeout.current = setTimeout(async () => {
          await spotifyTrackAnalyzer(
            id,
            spotifyToken,
            refreshToken,
            setSpotifyToken,
            resetAll,
            setMoodAnalysis,
            setLoading,
            setShowResults,
            setShowPrompt,
            setSelectedTrackID
          );
          analyzedTracks.add(id);
        }, 500);
      }
    }
    

    // Playback paused / resumed
    if (is_playing !== previousIsPlaying.current) {
      previousIsPlaying.current = is_playing;

      if (!is_playing && analyzeTimeout.current) {
        clearTimeout(analyzeTimeout.current);
        analyzeTimeout.current = null;
        toast.warning("⏸️ Playback paused. Analysis canceled.");

        setSelectedTrackID(null);
        setShowPrompt(true);
      } else if (is_playing && !analyzedTracks.has(id)) {
        analyzeTimeout.current = setTimeout(async () => {
          await spotifyTrackAnalyzer(
            id,
            spotifyToken,
            refreshToken,
            setSpotifyToken,
            resetAll,
            setMoodAnalysis,
            setLoading,
            setShowResults,
            setShowPrompt,
            setSelectedTrackID
          );
          analyzedTracks.add(id);
        }, 500);
      }
    }
  };

  // Initial check
  checkPlayback();
  // Poll every 3 seconds
  const interval = setInterval(checkPlayback, 3000);

  return () => {
    clearInterval(interval);
    if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);
  };
}, [spotifyToken, refreshToken]);

  return (
    <div className="flex flex-col items-center p-8 w-full gap-8">
      {/* Header */}
      <LogoHeader selectedTrackID={selectedTrackID} spotifyToken={spotifyToken} loading={loading}/>

      {/* Spotify Button */}
      {!selectedTrackID && !spotifyToken && !connecting && <SpotifyButton onClick={handleSpotifyClick} />}

      {/* Connecting state */}
      {connecting && !selectedTrackID && !spotifyToken && <LoadingSpinner message="Connecting to Spotify"/>}

      {/* Play song from spotify */}
      {showPrompt && (!selectedTrackID || !spotifyToken) && <PlayPrompt />}

      {/* Mood Analysis Results */}
      {!loading && selectedTrackID && showResults && moodAnalysis && <MoodResult analysis={moodAnalysis}/>}

    </div>
  );
}
