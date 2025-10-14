import axios from "axios";
import { SpotifyArtist } from "./spotifyTypes";
import { toast } from "sonner";
import { MoodScores } from "./moodTypes";

// GET USER PROFILE 
export const getUserProfile = async (accessToken: string) => {
  try {
    const res = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }); 

    if (res.status !== 200 || !res.data) return null;

    return res.data; // return full user profile data

  } catch (err) {
    console.error("Error fetching user profile:", err);
    toast.error("Error fetching user profile!");
    return null;
  } 
}

// GET CURRENT TRACK
export const getCurrentTrack = async (accessToken: string) => {
  try {
    const res = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    
    if (res.status === 204 || !res.data?.item) return null; // nothing playing

    const data = res.data;
 
    return {
      id: data.item.id,
      name: data.item.name,
      artists: data.item.artists.map((a: SpotifyArtist) => a.name).join(", "),
      spotifyUrl: data.item.external_urls.spotify,
      is_playing: data.is_playing ?? false
    };
  } catch (err) {
    console.error("Error fetching current track:", err);
    toast.error("Error fetching current track!");
    return null;
  }
};


//REFRESH TOKEN
export async function refreshAccessToken(
  refreshToken: string | null,
  setSpotifyToken: (token: string | null) => void,
  clearSpotifyToken: () => void
): Promise<string | null> {
  if (!refreshToken) {
    clearSpotifyToken();
    return null;
  }

  try {
    const { data } = await axios.post(`/api/spotify/refresh`, {
        refreshToken: refreshToken
    });


    if (!data.access_token) throw new Error("No access token returned");

    localStorage.setItem("spotifyToken", data.access_token);
    setSpotifyToken(data.access_token);

    return data.access_token;
  } catch (err) {
    console.error("Token refresh failed", err);
    clearSpotifyToken();
    return null;
  }
}

// CHECK TRACK AVAILABILITY
async function isTrackAvailable(trackID: string, token: string) {
  try {
    const { data } = await axios.get(`https://api.spotify.com/v1/tracks/${trackID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data.available_markets.includes("PH");
  } catch {
    return false;
  }
}

// SPOTIFY TRACK ANALYZER
export const spotifyTrackAnalyzer = async (
  trackID: string,
  token: string,
  refreshToken: string | null,
  setSpotifyToken: (token: string | null) => void,
  clearSpotifyToken: () => void,
  setMoodAnalysis: (data: MoodScores | null) => void,
  setLoading: (val: boolean) => void,
  setShowResults: (val: boolean) => void,
  setShowPrompt: (val: boolean) => void,
  setSelectedTrackID: (id: string | null) => void
): Promise<void> => {
  
  setLoading(true);
  setShowResults(false);
  setMoodAnalysis(null);
  setShowPrompt(false);

  try {
    const available = await isTrackAvailable(trackID, token);
    if (!available) {
        toast.warning("⚠️ This track is not available in your region.");
        setSelectedTrackID(null); 
        setShowPrompt(true); // go back to PlayPrompt
        return;
    }

    const { data: f } = await axios.get(
      `https://api.spotify.com/v1/audio-features?ids=${trackID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!f) {
      toast.error("No audio features found");
      return;
    }
 

    // Mood calculation
    const tempoNorm = Math.min(f.tempo / 200, 1);
    const moodScores: MoodScores = {
      happy: Math.round((f.valence * 0.6 + f.energy * 0.3 + f.danceability * 0.1) * 100),
      sad: Math.round(((1 - f.valence) * 0.5 + f.acousticness * 0.3 + (1 - f.energy) * 0.2) * 100),
      dreamy: Math.round((f.instrumentalness * 0.5 + f.acousticness * 0.3 + (1 - f.energy) * 0.2) * 100),
      energetic: Math.round((f.energy * 0.5 + tempoNorm * 0.3 + f.danceability * 0.2) * 100),
      chill: Math.round((f.acousticness * 0.5 + (1 - f.energy) * 0.3 + (1 - f.speechiness) * 0.2) * 100),
    };

    // Normalize to sum to 100
    const total = Object.values(moodScores).reduce((a, b) => a + b, 0);
    const normalized = Object.fromEntries(
      Object.entries(moodScores).map(([k, v]) => [k, Math.round((v / total) * 100)])
    ) as MoodScores;

    setMoodAnalysis(normalized);
    setShowResults(true);

  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : null;

    // Handle expired token (401)
    if (status === 401) {
    const newToken = await refreshAccessToken(refreshToken, setSpotifyToken, clearSpotifyToken);
    if (newToken) {
        return spotifyTrackAnalyzer(
            trackID,
            newToken,
            refreshToken,
            setSpotifyToken,
            clearSpotifyToken,
            setMoodAnalysis,
            setLoading,
            setShowResults,
            setShowPrompt,
            setSelectedTrackID
        );
    } else {
        toast.error("Spotify session expired. Please reconnect.");
        return;
    }
    } else if (status === 403) {
        toast.warning("This track is restricted or not available in your region.");
        setSelectedTrackID(null); 
        setShowPrompt(true); // go back to PlayPrompt
        return;
    }

    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error?.message || err.message
      : (err as Error).message || "Unknown error";
    toast.error(msg);
    console.error("Spotify analysis failed:", msg);

  } finally {
    setLoading(false);
  }
};
