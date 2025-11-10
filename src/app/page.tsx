'use client'
import { useEffect, useState, useRef, useCallback } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import LoadingSpinner from "./main_components/LoadingSpinner";
import LogoHeader from "./main_components/LogoHeader";
import PlayPrompt from "./main_components/PlayPrompt";
import { getCurrentTrack, getUserProfile } from "@/lib/spotifyLib/spotifyHelper";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { analyzeMood } from "@/lib/analysisMoodLib/analysisMoodHelper";
import MoodResult from "./main_components/Results/MoodResult";
import axios from "axios";

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

    const trackData = {
      name: track.name,
      artists: track.artists.map(a => a.name).join(", ")
    };

    setSelectedTrackID(id);
    setCurrentTrack(trackData);
    setShowPrompt(false);
    toast.info(`🎵 Now playing: ${track.name} by ${track.artists.map(a => a.name).join(", ")}`);

    isAnalyzingRef.current = true;
    setLoading(true);

    try {
      const artistName = track.artists[0]?.name ?? "Unknown Artist";

      //ANALYZE MOOD
      const result = await analyzeMood(artistName, track.name);

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
          const response = await axios.post("/api/database_server/save_analysis", {
            userProfile: profile,
            track: {
              id: track.id,
              name: track.name,
              artists: track.artists.map((a) => a.name).join(", "),
              preview_url: track.preview_url,
              spotify_url: track.external_urls.spotify,
            },
            analysisResult: result,
          })
        } catch (err : any) {
          console.error("Error saving analysis:", err.response?.data || err.message);
          toast.error("Failed to save analysis to database!");
        }
      }

    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Error analyzing the song mood! Please ");
      resetPlayback()

    } finally {
      isAnalyzingRef.current = false;
      setLoading(false);
    }
  }, [spotifyToken, showResults, selectedTrackID, setShowPrompt, resetPlayback]);

  
  //Poll track
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

  //showPrompt if no track
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
