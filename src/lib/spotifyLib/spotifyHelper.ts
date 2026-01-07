import axios from "axios";
import { SpotifyTrack, SpotifyUserProfile } from "./spotifyTypes";
import { toast } from "sonner";

// SAVE USER PROFILE
export const upsertUser = async(profile: SpotifyUserProfile) => {
  try {
    await axios.post('/api/upsert-user', {
        spotify_id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.images?.[0]?.url || null,
    })
    
  } catch (err) {
    console.error("Failed to add user:", err);
  }
}

// GET USER PROFILE 
export const getUserProfile = async (accessToken: string) => {
  try {
    const res = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }); 

    if (res.status !== 200 || !res.data) return null;

    return res.data;

  } catch (err) {
    console.error("Error fetching user profile:", err);
    toast.error("Error fetching user profile!");
    return null;
  } 
}

// GET CURRENT TRACK
export const getCurrentTrack = async (accessToken: string): Promise<SpotifyTrack & { is_playing: boolean } | null> => {
  try {
    const res = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.status === 204 || !res.data?.item || res.data.is_playing === false) {
      return null;
    }

    const apiData = res.data.item as {
      id: string;
      name: string;
      artists: { name: string }[];
      external_urls: { spotify: string };
      preview_url: string | null;
    };
 
    const track: SpotifyTrack = {
      id: apiData.id,
      name: apiData.name,
      artists: apiData.artists.map(a => ({ name: a.name })),
      external_urls: { spotify: apiData.external_urls.spotify },
      preview_url: apiData.preview_url ?? undefined,
    };


    return { ...track, is_playing: res.data.is_playing ?? false };
  } catch (err) {
    console.error("Error fetching current track:", err);
    toast.error("Error fetching current track!");
    return null;
  }
};


//REFRESH TOKEN
export async function refreshAccessToken( refreshToken: string | null, setSpotifyToken: (token: string | null) => void, clearSpotifyToken: () => void ): Promise<string | null> {
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
