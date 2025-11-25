import React from 'react'
import SpotifyButton from './SpotifyButton'
import { Volume2 } from 'lucide-react'

const openSpotify = () => window.open("https://open.spotify.com", "_blank")

export default function PlayPromptButton() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-2 text-white text-center p-4 rounded-lg">
    <p className="text-md lg:text-lg mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 select-none flex items-center justify-center gap-2">
      <Volume2 className="w-5 h-5 animate-pulse text-yellow-300" />
      Listening for your song
      <span className="text-purple-400 dark:text-white animate-pulse">...</span>
    </p>

        <SpotifyButton onClick={openSpotify} label="Open Spotify & Play Music" />    
    </div>
  )
}
