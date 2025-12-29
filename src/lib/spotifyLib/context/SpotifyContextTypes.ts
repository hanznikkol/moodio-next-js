import { Dispatch, SetStateAction } from "react";
import { SpotifyUserProfile } from "../spotifyTypes";

export interface SpotifyContextType {
  remainingCredits: number | null
  spotifyToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  appJWT: string | null; 
  supabaseJWT: string | null
  profile: SpotifyUserProfile | null;
  connecting: boolean;
  showPrompt: boolean;
  setRemainingCredits: Dispatch<SetStateAction<number | null>>
  setSpotifyToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setConnecting: (state: boolean) => void;
  setShowPrompt: (state: boolean) => void;
  resetAll: () => void;
}

export interface AppJWTPayload {
  sub: string;
  exp: number;
}