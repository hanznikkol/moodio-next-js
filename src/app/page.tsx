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
import { useSpotify } from "@/lib/context/spotifyContext";

export default function Home() {
  const {
    spotifyToken,
    refreshToken,
    connecting,
    showPrompt,
    setConnecting,
    setShowPrompt,
    setSpotifyToken,
    setRefreshToken,
    resetAll,
  } = useSpotify();
  
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodScores | null>(null);

  const previousTrackId = useRef<string | null>(null);
  const previousIsPlaying = useRef<boolean>(false);
  const analyzeTimeout = useRef<NodeJS.Timeout | null>(null);
  const analyzedTrack = useRef<Set<string>>(new Set());

  
  // Logging in Spotify
  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      setConnecting(true)
      window.location.href = "/api/spotify/login";
    }
  }

  // Clear Spotify tokens
  const resetPlayback = () => {
    previousTrackId.current = null;
    previousIsPlaying.current = false;
    analyzedTrack.current.clear();
    if (analyzeTimeout.current) {
      clearTimeout(analyzeTimeout.current);
      analyzeTimeout.current = null;
    }
    setSelectedTrackID(null);
    setShowResults(false);
    setMoodAnalysis(null);
  };

  useEffect(() => {
    if (!spotifyToken) return;

    const analyzedTracks = analyzedTrack.current;

    const checkPlayback = async () => {
      const track = await getCurrentTrack(spotifyToken);

      if (!track) {
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
        setSelectedTrackID(id);
        toast.info(`🎵 Now playing: ${track.name} by ${track.artists}`);

        if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);

        if (is_playing && !analyzedTracks.has(id)) {
          analyzeTimeout.current = setTimeout(async () => {
            await spotifyTrackAnalyzer(
              id,
              spotifyToken,
              refreshToken,
              setSpotifyToken,
              resetPlayback,
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
              resetPlayback,
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

    checkPlayback();
    const interval = setInterval(checkPlayback, 3000);
    return () => {
      clearInterval(interval);
      if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
