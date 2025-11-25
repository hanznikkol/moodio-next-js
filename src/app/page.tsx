'use client'
import { useEffect, useState, useRef, useCallback } from "react";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from "./main_components/LoadingSpinner";
import HeroHeader from "./main_components/HeroHeader";
import { getCurrentTrack, getUserProfile } from "@/lib/spotifyLib/spotifyHelper";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { analyzeMood } from "@/lib/analysisMoodLib/analysisMoodHelper";
import MoodResult from "./main_components/Result/MoodResult";
import PlayPromptButton from "./main_components/Buttons/PlayPromptButton";
import { useMood } from "@/lib/history/context/moodHistoryContext";
import axios from "axios";
import { SpotifyTrack } from "@/lib/spotifyLib/spotifyTypes";

export default function Home() {
  const { spotifyToken, connecting, showPrompt, setConnecting, setShowPrompt } = useSpotify();
  const { selectedAnalysis, setSelectedAnalysis, showResults, setShowResults } = useMood();

  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{ name: string; artists: string } | null>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<AnalysisResult | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const analyzedTracks = useRef<Set<string>>(new Set());
  const isAnalyzing = useRef(false);

  const resetPlayback = useCallback(() => {
    analyzedTracks.current.clear();
    isAnalyzing.current = false;
    setSelectedTrackID(null);
    setCurrentTrack(null);
    setMoodAnalysis(null);
    setShowPrompt(true);
    setSelectedAnalysis(null);
    setShowResults(false);
    setLoading(false);
  }, [setShowPrompt, setSelectedAnalysis, setShowResults]);

  // Function to process the currently playing track
  const handleTrack = useCallback(async (track: SpotifyTrack & { is_playing: boolean }) => {
    if (!track?.is_playing) return resetPlayback();
    if (analyzedTracks.current.has(track.id) || track.id === selectedTrackID || isAnalyzing.current) return;

    // Mark as processing
    analyzedTracks.current.add(track.id);
    setSelectedTrackID(track.id);
    setCurrentTrack({ name: track.name, artists: track.artists.map(a => a.name).join(", ") });
    setShowPrompt(false);
    toast.info(`🎵 Now playing: ${track.name} by ${track.artists.map(a => a.name).join(", ")}`);

    // Start analysis
    setLoading(true);
    isAnalyzing.current = true;

    try {
      const result = await analyzeMood(track.artists[0]?.name ?? "Unknown Artist", track.name);
      if (!result) throw new Error("Provider did not return analysis!");

      setMoodAnalysis(result);
      setShowResults(true);

      const profile = await getUserProfile(spotifyToken!);
      if (profile) {
        await axios.post(
          "/api/database_server/save_analysis",
          {
            userProfile: profile,
            track: {
              id: track.id,
              name: track.name,
              artists: track.artists.map(a => a.name).join(", "),
              preview_url: track.preview_url,
              spotify_url: track.external_urls.spotify,
            },
            analysisResult: result,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("appJWT")}` } }
        );
      }
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Error analyzing the song mood! Please try again.");
      resetPlayback();
    } finally {
      setLoading(false);
      isAnalyzing.current = false;
    }
  }, [resetPlayback, selectedTrackID, spotifyToken, setShowPrompt, setShowResults]);
  
  // Polling the current track
  const { data: track, error } = useQuery<SpotifyTrack & { is_playing: boolean } | null, Error>({
    queryKey: ["currentTrack", spotifyToken],
    queryFn: () => getCurrentTrack(spotifyToken!),
    refetchInterval: 25000,
    enabled: !!spotifyToken && !showResults && isVisible,
  }); 
  
  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error("Failed to fetch current Spotify track. Retrying...");
      resetPlayback();
    }
  }, [error, resetPlayback]);

  useEffect(() => {
    if (track) {
      handleTrack(track);
    }
  }, [track, handleTrack]);
  
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (selectedAnalysis) {
      setShowPrompt(false); 
    } else if (spotifyToken && !selectedTrackID) {
      setShowPrompt(true);
    }
  }, [selectedAnalysis, spotifyToken, selectedTrackID, setShowPrompt]);

  const handleSpotifyClick = () => {
    if (!spotifyToken) {
      setConnecting(true)
      window.location.href = "/api/spotify/login";
    }
  }
  const handleAnalyzeAnotherSong = () => {
    resetPlayback();
  };

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

      {/* Play song from Spotify */}
      {spotifyToken && showPrompt && <PlayPromptButton />}

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
