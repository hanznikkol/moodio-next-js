'use client'
import { useEffect, useState, useRef, useCallback } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import LoadingSpinner from "./main_components/LoadingSpinner";
import LogoHeader from "./main_components/LogoHeader";
import PlayPrompt from "./main_components/PlayPrompt";
import { getCurrentTrack } from "@/lib/spotifyLib/spotifyHelper";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { analyzeMood } from "@/lib/analysisMoodLib/analysisMoodHelper";
import MoodResult from "./main_components/Results/MoodResult";

export default function Home() {
  // Spotify context
  const {
    spotifyToken,
    connecting,
    showPrompt,
    setConnecting,
    setShowPrompt,
    resetAll,
  } = useSpotify();

  // State variables
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<AnalysisResult | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{ name: string; artists: string } | null>(null);

  const analyzedTracks = useRef<Set<string>>(new Set());
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isAnalyzingRef = useRef(false);

  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      setConnecting(true)
      window.location.href = "/api/spotify/login";
    }
  }

  const handleAnalyzeAnotherSong = () => {
    resetPlayback()
    checkPlayback()
    pollingRef.current = setInterval(checkPlayback, 25000)
  }

  // Clear state when needed 
  const resetPlayback = useCallback(() => {
    analyzedTracks.current.clear();
    if (pollingRef.current) clearInterval(pollingRef.current);
    isAnalyzingRef.current = false;
    setSelectedTrackID(null);
    setCurrentTrack(null);
    setShowResults(false);
    setMoodAnalysis(null);
    setShowPrompt(true);
  }, [setShowPrompt]);

  // Check current Spotify Playback
  const checkPlayback = useCallback(async () => {
    if (!spotifyToken || isAnalyzingRef.current || showResults) return;

    const track = await getCurrentTrack(spotifyToken);
    if (!track || !track.is_playing) {
      setSelectedTrackID(null);
      setCurrentTrack(null);
      setShowResults(false);
      setMoodAnalysis(null);
      setShowPrompt(true);
      return;
  }

    const { id, is_playing } = track;
    if (!is_playing || analyzedTracks.current.has(id) || id === selectedTrackID) return;

    setSelectedTrackID(id);
    setCurrentTrack({ name: track.name, artists: track.artists });
    setShowPrompt(false);
    toast.info(`🎵 Now playing: ${track.name} by ${track.artists}`);

    isAnalyzingRef.current = true;
    setLoading(true);

    try {
      const artistName = track.artists.split(",")[0];

      //  Cached version avoids API spam
      const result = await analyzeMood(artistName, track.name);

      if (!result) {
        toast.error("AI did not return analysis!");
        resetPlayback();
        return;
      }

      setMoodAnalysis(result);
      setShowResults(true);
      analyzedTracks.current.add(id);

    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Error analyzing the song mood! Please ");
      resetPlayback()

    } finally {
      isAnalyzingRef.current = false;
      setLoading(false);
    }
  }, [spotifyToken, showResults, selectedTrackID, setShowPrompt, resetPlayback]);


  useEffect(() => {
    if (!spotifyToken || showResults) return

    checkPlayback()
    pollingRef.current = setInterval(checkPlayback, 25000);
    
    // Tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      } else if (!document.hidden && !pollingRef.current) {
        checkPlayback();
        pollingRef.current = setInterval(checkPlayback, 25000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

  }, [spotifyToken, checkPlayback])

  useEffect(() => {
    if (spotifyToken && !showPrompt && !loading && !showResults) {
      setShowPrompt(true);
    }
  }, [spotifyToken, showPrompt, loading, showResults, setShowPrompt]);


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
      
      {!selectedTrackID && !spotifyToken && !connecting && (
        <>
          <div className="mt-4">
            <SpotifyButton onClick={handleSpotifyClick} />
          </div>
        </>
      )}

      {/* Connecting state */}
      {connecting && !selectedTrackID && !spotifyToken && <LoadingSpinner message="Connecting to Spotify"/>}

      {/* Play song from spotify */}
      {showPrompt && <PlayPrompt />}

      {/* Mood Analysis Results */}
      {!loading && selectedTrackID && showResults && moodAnalysis && <MoodResult analysis={moodAnalysis} />}

      {/* Analyze another song */}
      {!loading && selectedTrackID && showResults && moodAnalysis && (       
        <div>
          <SpotifyButton label="Analyze another song" onClick={handleAnalyzeAnotherSong}/>
        </div>
      )}

    </div>
  );
}
