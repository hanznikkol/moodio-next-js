"use client";
import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SpotifyUserProfile } from "../spotifyTypes";
import { getUserProfile, refreshAccessToken } from "../spotifyHelper";
import { jwtDecode } from 'jwt-decode'
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/supabaseClient";
import { AppJWTPayload, SpotifyContextType } from "./SpotifyContextTypes";

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({children}: {children: React.ReactNode}) => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

  // Decode appJWT to get userId
  useEffect(() => {
    if (!appJWT) {
      setUserId(null);
      return;
    }

    try {
      const decoded: AppJWTPayload = jwtDecode(appJWT);
      setUserId(decoded.sub);
    } catch (err) {
      console.error("Failed to decode app JWT", err);
      setUserId(null);
    }
  }, [appJWT]);

  // Fetch profile when spotifyToken changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("access_token");
    const refreshFromUrl = params.get("refresh_token");
    const app_jwt_fromUrl = params.get("app_jwt");
    const error = params.get("error");

    const handleUrlLogin = () => {
      if (error) {
        resetAll();
        toast.error("Spotify login failed.");
        window.history.replaceState({}, document.title, "/");
        return true;
      }

      if(tokenFromUrl) {
        setSpotifyToken(tokenFromUrl);
        if (refreshFromUrl) setRefreshToken(refreshFromUrl);
        if (app_jwt_fromUrl) setAppJWT(app_jwt_fromUrl);

        localStorage.setItem("spotifyToken", tokenFromUrl);
        if (refreshFromUrl) localStorage.setItem("spotifyRefreshToken", refreshFromUrl);
        if (app_jwt_fromUrl) localStorage.setItem("appJWT", app_jwt_fromUrl);

        toast.success("Spotify connected successfully!");
        window.history.replaceState({}, document.title, "/");
        return true;
      }
      return false
    }

    const isUrlHandled = handleUrlLogin()
    if (isUrlHandled) return

    // Restore session from Supabase
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching Supabase session:", error);
        return;
      }
      if (session?.provider_token) {
        setSpotifyToken(session.provider_token);
        setConnecting(false);
        toast.success("Spotify session restored!");
      }
    }

    fetchSession()

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        setSpotifyToken(session.provider_token);
        setConnecting(false);
      } else {
        resetAll();
      }
    });

    return () => listener.subscription.unsubscribe()
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
      { value: { spotifyToken, refreshToken, userId, appJWT, profile, connecting, showPrompt, setSpotifyToken, setRefreshToken, setConnecting, setShowPrompt, resetAll } },
      children
  );
}

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used within a SpotifyProvider");
  return ctx;
};