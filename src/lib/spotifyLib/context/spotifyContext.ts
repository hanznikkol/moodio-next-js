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
  const [supabaseJWT, setSupabaseJWT] = useState<string | null>(null);
  const [profile, setProfile] = useState<SpotifyUserProfile | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Reset Spotify states
  const resetAll = useCallback(() => {
    setSpotifyToken(null);
    setRefreshToken(null);
    setProfile(null);
    setConnecting(false);
    setShowPrompt(false);
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
    const restoreSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Supabase session error:", error);
        return;
      }

      if (session?.provider_token) {
        setSpotifyToken(session.provider_token);
        toast.success("Spotify connected sucessfully");
      }

      if (session?.access_token) setSupabaseJWT(session.access_token);      
    };

    restoreSession()

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        setSpotifyToken(session.provider_token);
        setSupabaseJWT(session.access_token || null);
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

    const userHandler = async () => {
      const profileData = await getUserProfile(spotifyToken);
      if (profileData) {
        setProfile(profileData);

        try {
          const { data: { user } } = await supabase.auth.getUser(); // Supabase session user
          if (user) {
            await supabase
              .from("users")
              .upsert({
                user_id: user.id, // Supabase user ID
                spotify_id: profileData.id,
                display_name: profileData.display_name,
                avatar_url: profileData.images?.[0]?.url || null,
              }, { onConflict: "user_id" });
          }
        }catch(err) {
          console.error("Failed to upsert user:", err);
        }
      }
    }
    
    userHandler()
    // getUserProfile(spotifyToken).then(profileData => {
    //   if (profileData) setProfile(profileData)
    // })
  }, [spotifyToken]);

  return createElement(
      SpotifyContext.Provider,
      { value: { spotifyToken, refreshToken, userId, appJWT, supabaseJWT, profile, connecting, showPrompt, setSpotifyToken, setRefreshToken, setConnecting, setShowPrompt, resetAll } },
      children
  );
}

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used within a SpotifyProvider");
  return ctx;
};