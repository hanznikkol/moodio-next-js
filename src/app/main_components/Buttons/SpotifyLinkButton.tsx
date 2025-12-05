import React from 'react'
import { FaSpotify } from 'react-icons/fa6';

interface SpotifyLinkButtonProps {
    trackUri?: string | null,
    trackName?: string | null,
    trackArtist?: string | null,
    className?: string 
}

function SpotifyLinkButton({trackUri, trackName, trackArtist, className}: SpotifyLinkButtonProps) {
  const href = trackUri?.startsWith("spotify:track:") 
   ? `https://open.spotify.com/track/${trackUri.split(":")[2]}` : trackName && trackArtist 
   ? `https://open.spotify.com/search/${encodeURIComponent(trackName + " " + trackArtist)}` : "#";
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors font-semibold text-sm ${className || ""}`}
    >
      <FaSpotify className="w-4 h-4" />
      Listen
    </a>
  )
}

export default SpotifyLinkButton