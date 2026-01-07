import axios from "axios";
import { getUserProfile } from "../spotifyLib/spotifyHelper";
import { analyzeMood } from "./analysisMoodHelper";
import { AnalysisResult } from "./analysisResult";
import { SpotifyTrack } from "../spotifyLib/spotifyTypes";

  export async function analyzeAndSaveTrack(  
    track: SpotifyTrack,
    spotifyToken: string,
    supabaseJWT: string | null
  ): Promise<{ result: AnalysisResult; remainingCredits: number }> {
    const artistName = track.artists[0]?.name ?? "Unknown Artist";

    //Analyze Mood
    const result = await analyzeMood(artistName, track.name, spotifyToken);
    if(!result) throw new Error("Provider did not return analysis")

    if(!supabaseJWT) throw new Error('Not authenticated')
    
    //Save to database server + consume
    const profile = await getUserProfile(spotifyToken)
    try {
      const res = await axios.post("/api/database_server/save_analysis", {
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

     const analysesId = res.data.saved.analyses_id

     return {result: {...result, analysesId}, remainingCredits: res.data.remainingCredits}
     
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const message = err.response?.data.error ?? err.message ?? "Failed to save analysis"
        
        if(status == 403) {
          throw new Error("Daily credit limit reached")
        }

        throw new Error(message)
      }

      throw err
    }
  }