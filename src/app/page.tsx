'use client'
import { useEffect, useState, useRef, useCallback } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/analysisResult";
import LoadingSpinner from "./main_components/LoadingSpinner";
import LogoHeader from "./main_components/LogoHeader";
import PlayPrompt from "./main_components/PlayPrompt";
import { getCurrentTrack } from "@/lib/spotifyHelper";
import { useSpotify } from "@/lib/context/spotifyContext";
import { analyzeMood } from "@/lib/analysisMoodHelper";
import MoodResult from "./main_components/Results/MoodResult";

export default function Home() {
  // Spotify context
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

  // State variables
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<AnalysisResult | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{ name: string; artists: string } | null>(null);

  // Refs for non-reactive values
  const analyzedTracks = useRef<Set<string>>(new Set());
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isAnalyzingRef = useRef(false);

  // Logging in Spotify
  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      setConnecting(true)
      window.location.href = "/api/spotify/login";
    }
  }
  // Clear state when needed 
  const resetPlayback = useCallback(() => {
    analyzedTracks.current.clear();
    if (pollingRef.current) clearInterval(pollingRef.current);
    isAnalyzingRef.current = false;
    setSelectedTrackID(null);
    setShowResults(false);
    setMoodAnalysis(null);
  }, []);

  // Check current Spotify Playback
  const checkPlayback = useCallback(async () => {
    if (!spotifyToken || isAnalyzingRef.current) return;

    const track = await getCurrentTrack(spotifyToken);
    if (!track) {
      setSelectedTrackID(null);
      setShowPrompt(true);
      return;
    }

    const { id, is_playing } = track;

    // Skip if same track or already analyzed
    if (analyzedTracks.current.has(id) || id === selectedTrackID) return;

    if (is_playing) {
      setSelectedTrackID(id);
      setCurrentTrack({name: track.name, artists: track.artists})
      setShowPrompt(false);
      toast.info(`🎵 Now playing: ${track.name} by ${track.artists}`);

      // Prevent double-analysis
      isAnalyzingRef.current = true;
      setLoading(true);

      // Fetch Result
      try {
        const result = await analyzeMood(track.artists.split(",")[0], track.name);
        setMoodAnalysis(result);
        setShowResults(true);
        analyzedTracks.current.add(id);
      } catch (err) {
        console.error("Analysis error:", err);
        toast.error("Error analyzing the song mood!");
        resetPlayback();
      } finally {
        isAnalyzingRef.current = false;
        setLoading(false);
      }
      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyToken, selectedTrackID, resetPlayback])

  useEffect(() => {
    if (!spotifyToken) return

    checkPlayback()

    //Poll every 10s
    pollingRef.current = setInterval(checkPlayback, 15000);
    
    // Pause when tab hidden (auto performance)
    const handleVisibilityChange = () => {
      if (document.hidden && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      } else if (!document.hidden && !pollingRef.current) {
        checkPlayback();
        pollingRef.current = setInterval(checkPlayback, 10000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

  }, [spotifyToken, checkPlayback])


  return (
    <div className="flex flex-col items-center p-8 w-full gap-6">
      {/* Header */}
      <LogoHeader
        selectedTrackID={selectedTrackID}
        spotifyToken={spotifyToken}
        loading={loading}
        trackName={currentTrack?.name ?? null}
        trackArtist={currentTrack?.artists ?? null}
      />

      {/* Spotify Button */}
      {!selectedTrackID && !spotifyToken && !connecting && <SpotifyButton onClick={handleSpotifyClick} />}

      {/* Connecting state */}
      {connecting && !selectedTrackID && !spotifyToken && <LoadingSpinner message="Connecting to Spotify"/>}

      {/* Play song from spotify */}
      {showPrompt && (!selectedTrackID || !spotifyToken) && <PlayPrompt />}

      {/* Mood Analysis Results */}
      {!loading && selectedTrackID && showResults && moodAnalysis && <MoodResult analysis={moodAnalysis} />}

      {/* Analyze another song */}
      {!loading && selectedTrackID && showResults && moodAnalysis && (       
        <div>
          <SpotifyButton label="Analyze another song" onClick={() => {}}/>
        </div>
      )}

    </div>
  );
}
