'use client'
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import LoadingSpinner from "./main_components/LoadingSpinner";
import HeroHeader from "./main_components/HeroHeader";
import { getCurrentTrack } from "@/lib/spotifyLib/spotifyHelper";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import MoodResult from "./main_components/Result/MoodResult";
import PlayPromptButton from "./main_components/Buttons/PlayPromptButton";
import { useMood } from "@/lib/history/context/moodHistoryContext";
import { supabase } from "@/lib/supabase/supabaseClient";
import { analyzeAndSaveTrack } from "@/lib/analysisMoodLib/analyzeAndSave";
import { fetchUserCredits } from "@/lib/analysisMoodLib/creditsHelper";

export default function Home() {
  const {spotifyToken, connecting, setConnecting , setShowPrompt, supabaseJWT, remainingCredits, setRemainingCredits } = useSpotify();
  const {selectedAnalysis, setSelectedAnalysis, showResults, setShowResults } = useMood();

  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<AnalysisResult | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{ name: string; artists: string } | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const manualStopRef = useRef(false)

  const analyzedTracks = useRef<Set<string>>(new Set());
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isAnalyzingRef = useRef(false);

  //== LOGIN SPOTIFY ==
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
    manualStopRef.current = true;
    setShowPrompt(false);
  }
  
  // == RESET WHEN NEEDED ==
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

  // == STOP POLLING ==
  const stopPolling = useCallback(() => {
    if(pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setIsPolling(false)
  }, [])

  // == CHECK CURRENT SPOTIFY PLAYBACK ==
  const checkPlayback = useCallback(async () => {
    if (!spotifyToken || isAnalyzingRef.current) return;

    const track = await getCurrentTrack(spotifyToken);
    if (!track || !track.is_playing) {
      setSelectedTrackID(null);
      setCurrentTrack(null);
      setShowResults(false);
      setMoodAnalysis(null);
      if (!manualStopRef.current && !connecting) {
        setShowPrompt(true)
      }

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

    //Analyze and Save
    try {
      const {result, remainingCredits: updatedCredits} = await analyzeAndSaveTrack(track, spotifyToken, supabaseJWT);
      setMoodAnalysis(result);
      setShowResults(true);
      analyzedTracks.current.add(id);
      setRemainingCredits(updatedCredits)
      stopPolling()
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Error analyzing the song mood! Please try again later.");
      stopPolling()
      setSelectedTrackID(null);
      setCurrentTrack(null);
      manualStopRef.current = true

    } finally {
      isAnalyzingRef.current = false;
      setLoading(false);
    }
  }, [spotifyToken, showResults, selectedTrackID, setShowPrompt, resetPlayback]);

  //==START POLLING SONGS==
  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    setIsPolling(true)
    pollingRef.current = setInterval(checkPlayback, 20000)
    checkPlayback()
  }, [checkPlayback])

  const handleAnalyzeAnotherSong = () => {
    resetPlayback()
    startPolling()
  }
  
  //== POLLING EFFECT ==
  useEffect(() => {
    if (!spotifyToken || showResults || manualStopRef.current) return

    const handleVisibilityChange = () => {
      if(!document.hidden && isPolling) {
        checkPlayback()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [spotifyToken, showResults])


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
        analysis={selectedAnalysis ?? moodAnalysis}
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

      {spotifyToken && !showResults && !isPolling && !loading && (
        <SpotifyButton
          onClick={() => {
            manualStopRef.current = false
            setShowPrompt(true);
            startPolling()
          }}
          label="Start Listening"
        />
      )}

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

      {spotifyToken && remainingCredits !== null && (
        remainingCredits > 0 ? (
          <div className="text-sm text-muted-foreground">
            Credits left today: <span className="font-semibold">{remainingCredits}</span>
          </div>
        ) : (
          <p className="text-muted-foreground">No credits left today</p>
        )
      )}
      
    </div>
  );
}