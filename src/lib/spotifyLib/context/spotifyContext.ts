"use client";
import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SpotifyUserProfile } from "../spotifyTypes";
import { getUserProfile, refreshAccessToken } from "../spotifyHelper";
import { toast } from "sonner";

interface SpotifyContextType {
  spotifyToken: string | null;
  refreshToken: string | null;
  appJWT: string | null; 
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
  const [appJWT, setAppJWT] = useState<string | null>(null);
  const [profile, setProfile] = useState<SpotifyUserProfile | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset Spotify states
  const resetAll = useCallback(() => {
    setSpotifyToken(null);
    setRefreshToken(null);
    setProfile(null);
    setConnecting(false);
    setShowPrompt(false);

    if(refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
    localStorage.removeItem("spotifyToken");
    localStorage.removeItem("spotifyRefreshToken");
    localStorage.removeItem("appJWT")
    }, [])

  // Fetch profile when spotifyToken changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const refresh = params.get("refresh_token");
    const app_jwt = params.get("app_jwt")
    const error = params.get("error");

    if (error) {
        resetAll();
        toast.error("Spotify login failed.");
        return window.history.replaceState({}, document.title, "/");
    }

    const savedToken = localStorage.getItem("spotifyToken");
    const savedRefresh = localStorage.getItem("spotifyRefreshToken");

    if (savedToken) setSpotifyToken(savedToken);
    if (savedRefresh) setRefreshToken(savedRefresh);

    // If we have a new token from URL params, use it
    if (token) {
        setSpotifyToken(token);
        localStorage.setItem("spotifyToken", token);
        toast.success("Spotify connected successfully!");
        // console.log("Spotify token acquired:", token);
        window.history.replaceState({}, document.title, "/");
    }
    
    if (refresh) {
        setRefreshToken(refresh);
        localStorage.setItem("spotifyRefreshToken", refresh);
    }

    if (app_jwt) {
      setAppJWT(app_jwt);
      localStorage.setItem("appJWT", app_jwt);
    }

    // Immediate refresh if saved refresh token exists
    if (!token && savedRefresh) {
      refreshAccessToken(savedRefresh, setSpotifyToken, resetAll)
      .then((newToken) => {
        if (newToken) console.log("Refreshed token on reload")
        else console.warn("No access returned on initial refresh")  
      }).catch((err) => {
        console.error("Initial refresh failed: ", err)
      }
      )
    }
  }, [resetAll]);

  // Fetch profile when spotifyToken changes
  useEffect(() => {
    if (!spotifyToken) return;
    
    getUserProfile(spotifyToken).then(profileData => {
      if (profileData) setProfile(profileData)
    })
  }, [spotifyToken]);

  //Refresh token auto every 50 mins
  useEffect(() => {
    if (!refreshToken) return

    const doRefresh = async () => {
      const newToken = await refreshAccessToken(refreshToken, setSpotifyToken, resetAll)
      if (newToken) console.log("Spotify token auto refreshed")
      else toast.error("Spotify session expired. Please reconnect.");
    }

    doRefresh()

    refreshIntervalRef.current = setInterval(doRefresh, 50 * 60 * 1000)

    return () => {
       if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    }
  }, [refreshToken, resetAll])

  return createElement(
      SpotifyContext.Provider,
      { value: { spotifyToken, refreshToken, appJWT, profile, connecting, showPrompt, setSpotifyToken, setRefreshToken, setConnecting, setShowPrompt, resetAll } },
      children
  );
}

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used within a SpotifyProvider");
  return ctx;
};