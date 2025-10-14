"use client";
import { createContext, createElement, useContext, useEffect, useState } from "react";
import { SpotifyUserProfile } from "../spotifyTypes";
import { toast } from "sonner";
import axios from "axios";

interface SpotifyContextType {
  spotifyToken: string | null;
  refreshToken: string | null;
  profile: SpotifyUserProfile | null;
  connecting: boolean;
  showPrompt: boolean;
  setSpotifyToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setConnecting: (state: boolean) => void;
  setShowPrompt: (state: boolean) => void;
  resetAll: () => void;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({children}: {children: React.ReactNode}) => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<SpotifyUserProfile | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Clear all Spotify-related states and localStorage
  const resetAll = () => {
    setSpotifyToken(null);
    setRefreshToken(null);
    setProfile(null);
    setConnecting(false);
    setShowPrompt(false);
    
    localStorage.removeItem("spotifyToken");
    localStorage.removeItem("spotifyRefreshToken");
  };

  // Fetch Spotify user profile when token changes
  const fetchProfile = async (token: string) => {
    try {
      const res = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch Spotify profile:", err);
    }
  };

    // Fetch profile when spotifyToken changes
    useEffect(() => {
    // Get tokens from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const refresh = params.get("refresh_token");
    const error = params.get("error");

    //// If there was an error during Spotify authentication
    if (error) {
        resetAll();
        toast.error("Spotify login failed.");
        return window.history.replaceState({}, document.title, "/");
    }

    const savedToken = localStorage.getItem("spotifyToken");
    const savedRefresh = localStorage.getItem("spotifyRefreshToken");

    if (savedToken) setSpotifyToken(savedToken);
    if (savedRefresh) setRefreshToken(savedRefresh);

    //// If we have a new token from URL params, use it
    if (token) {
        setSpotifyToken(token);
        localStorage.setItem("spotifyToken", token);
        toast.success("Spotify connected successfully!");
        console.log("Spotify token acquired:", token);
        window.history.replaceState({}, document.title, "/");
    }
    
    //// If we have a new refresh token from URL params, use it
    if (refresh) {
        setRefreshToken(refresh);
        localStorage.setItem("spotifyRefreshToken", refresh);
    }
    }, []);

    //// Fetch profile when spotifyToken changes
    useEffect(() => {
        if (spotifyToken) fetchProfile(spotifyToken);
    }, [spotifyToken]);

    return createElement(
        SpotifyContext.Provider,
        { value: { spotifyToken, refreshToken, profile, connecting, showPrompt, setSpotifyToken, setRefreshToken, setConnecting, setShowPrompt, resetAll } },
        children
    );
}

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used within a SpotifyProvider");
  return ctx;
};