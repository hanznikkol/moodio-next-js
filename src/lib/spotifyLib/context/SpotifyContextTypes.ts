import { SpotifyUserProfile } from "../spotifyTypes";

export interface SpotifyContextType {
  spotifyToken: string | null;
  refreshToken: string | null;
  userId: string | null;
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

export interface AppJWTPayload {
  sub: string;
  exp: number;
}