import axios from "axios";
import { SpotifyArtist } from "./spotifyTypes";
import { toast } from "sonner";

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
