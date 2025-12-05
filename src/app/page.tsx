'use client'
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import LoadingSpinner from "./main_components/LoadingSpinner";
import HeroHeader from "./main_components/HeroHeader";
import { getCurrentTrack, getUserProfile } from "@/lib/spotifyLib/spotifyHelper";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { analyzeMood } from "@/lib/analysisMoodLib/analysisMoodHelper";
import MoodResult from "./main_components/Result/MoodResult";
import PlayPromptButton from "./main_components/Buttons/PlayPromptButton";
import { useMood } from "@/lib/history/context/moodHistoryContext";
import axios from "axios";
import { supabase } from "@/lib/supabase/supabaseClient";

export default function Home() {
  const {spotifyToken, connecting, setConnecting, showPrompt , setShowPrompt, supabaseJWT } = useSpotify();
  const {selectedAnalysis, setSelectedAnalysis, showResults, setShowResults } = useMood();

  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<AnalysisResult | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{ name: string; artists: string } | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const analyzedTracks = useRef<Set<string>>(new Set());
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isAnalyzingRef = useRef(false);

  const handleSpotifyClick = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-read-private user-read-playback-state user-read-currently-playing user-top-read',
        redirectTo: process.env.NEXT_PUBLIC_BASE_URL!
      }
    })

    if (error) {
      toast.error('Failed to start Spotify login!')
      console.error(error)
      return
    }
    setConnecting(true)
  }
  
  // Clear state when needed 
  const resetPlayback = useCallback(() => {
    analyzedTracks.current.clear();
    if (pollingRef.current) clearInterval(pollingRef.current);
    isAnalyzingRef.current = false;
    // Reset Spotify states
    setSelectedTrackID(null);
    setCurrentTrack(null);
    setMoodAnalysis(null);
    setShowPrompt(true);

    // Reset mood history selection
    setSelectedAnalysis(null);
    setShowResults(false);
  }, [setShowPrompt, setSelectedAnalysis, setShowResults]);

  // Check current Spotify Playback
  const checkPlayback = useCallback(async () => {
    if (!spotifyToken || isAnalyzingRef.current) return;

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

    const trackArtist = track.artists.map(a => a.name).join(", ");

    const trackData = {
      name: track.name,
      artists: trackArtist
    };

    setSelectedTrackID(id);
    setCurrentTrack(trackData);
    setShowPrompt(false);
    toast.info(`🎵 Now playing: ${track.name} by ${trackArtist}`);

    isAnalyzingRef.current = true;
    setLoading(true);

    try {
      const artistName = track.artists[0]?.name ?? "Unknown Artist";

      //ANALYZE MOOD
      const result = await analyzeMood(artistName, track.name, spotifyToken);

      if (!result) {
        toast.error("Provider did not return analysis!");
        resetPlayback();
        return;
      }

      setMoodAnalysis(result);
      setShowResults(true);
      analyzedTracks.current.add(id);

      //Save to database server
      const profile = await getUserProfile(spotifyToken)
      if (profile && trackData) {
        try {
          await axios.post("/api/database_server/save_analysis", {
            userProfile: profile,
            track: {
              id: track.id,
              name: track.name,
              artists: track.artists.map((a) => a.name),
              preview_url: track.preview_url,
              spotify_url: track.external_urls.spotify,
            },
            analysisResult: result,
          }, {
            headers: {
              Authorization: `Bearer ${supabaseJWT}`
            }
          })
        } catch (err : any) {
          console.error("Error saving analysis:", err.response?.data || err.message);
          toast.error("Failed to save analysis to database!");
        }
      }

    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Error analyzing the song mood! Please try again.");
      resetPlayback()

    } finally {
      isAnalyzingRef.current = false;
      setLoading(false);
    }
  }, [spotifyToken, showResults, selectedTrackID, setShowPrompt, resetPlayback]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    setIsPolling(true)
    pollingRef.current = setInterval(checkPlayback, 20000)
    checkPlayback()
  }, [checkPlayback])

  const stopPolling = useCallback(() => {
    if(pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setIsPolling(false)
  }, [])

  const handleAnalyzeAnotherSong = () => {
    resetPlayback()
    startPolling()
  }
  
  //Poll track
  useEffect(() => {
    if (!spotifyToken || showResults) return

    startPolling()
    
    // Tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        startPolling()
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling()
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

  }, [spotifyToken, showResults, startPolling, stopPolling])


  // Hide prompt when a history item is selected
  useEffect(() => {
    if (selectedAnalysis) {
      setShowPrompt(false);
    }
  }, [selectedAnalysis, setShowPrompt]);

  return (
    <div className="flex flex-col items-center p-8 w-full gap-6">
      {/* Hero Header */}
      <HeroHeader
        selectedTrackID={selectedTrackID}
        spotifyToken={spotifyToken}
        loading={loading}
        trackName={currentTrack?.name ?? null}
        trackArtist={currentTrack?.artists ?? null}
        historyTrackName={selectedAnalysis?.trackName ?? null}
        historyTrackArtist={selectedAnalysis?.trackArtist ?? null}
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

      {spotifyToken && !showResults && !isPolling && !loading && <SpotifyButton onClick={startPolling} label="Start Listening"/>}

      {/* Play song from Spotify */}
      {spotifyToken && isPolling && !loading && !currentTrack && <PlayPromptButton onStop={stopPolling} />}

      {/* Mood Analysis Results */}
      {spotifyToken && (selectedAnalysis || (!loading && selectedTrackID && showResults && moodAnalysis)) && (
        <MoodResult analysis={selectedAnalysis ?? moodAnalysis!} />
      )}

      {/* Analyze another song */}
      {spotifyToken && !loading && (moodAnalysis || selectedAnalysis) && (
        <SpotifyButton label="Analyze another song" onClick={handleAnalyzeAnotherSong} />
      )}
      
    </div>
  );
}