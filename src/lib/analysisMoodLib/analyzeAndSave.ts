import axios from "axios";
import { getUserProfile } from "../spotifyLib/spotifyHelper";
import { analyzeMood } from "./analysisMoodHelper";
import { AnalysisResponse } from "./analysisResult";
import { SpotifyTrack } from "../spotifyLib/spotifyTypes";
import { toast } from "sonner";

export async function analyzeAndSaveTrack(  
  track: SpotifyTrack,
  spotifyToken: string,
  supabaseJWT: string | null
): Promise<AnalysisResponse | null> {
    const artistName = track.artists[0]?.name ?? "Unknown Artist";

    //Analyze Mood
    const result = await analyzeMood(artistName, track.name, spotifyToken);
    if(!result) throw new Error("Provider did not return analysis")
    
    //Save to database server
    try {
        const profile = await getUserProfile(spotifyToken)
        if (profile) {
          await axios.post("/api/database_server/save_analysis", {
            userProfile: profile,
            track: {
              id: track.id,
              name: track.name,
              artists: track.artists.map((a) => a.name),
              preview_url: track.preview_url,
              spotify_url: track.external_urls.spotify,
            },
            analysisResult: result,
          }, {
            headers: {
              Authorization: `Bearer ${supabaseJWT}`
            }
          })
        }
    } catch (err: any) {
        console.log(err.message || "Could not analyze song.")
        toast.error(err.message || "Could not analyze song.");
        return null;
    }
    return result
}