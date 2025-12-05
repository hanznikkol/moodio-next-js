import React from 'react'
import SpotifyButton from './SpotifyButton'
import { Square, Volume2 } from 'lucide-react'

interface PlayPromptButtonProps {
  onStop?: () => void
}

const openSpotify = () => window.open("https://open.spotify.com", "_blank")

export default function PlayPromptButton({onStop}: PlayPromptButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-2 text-white text-center p-4 rounded-lg">
      <p className="text-md lg:text-lg mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 select-none flex items-center justify-center gap-2">
        <Volume2 className="w-5 h-5 animate-pulse text-yellow-300" />
        Listening for your song
        <span className="text-purple-400 dark:text-white animate-pulse">...</span>
      </p>

      {/* Open Spotify to play music */}
      <SpotifyButton onClick={openSpotify} label="Open Spotify & Play Music" />

      {/* Stop Button */}
      {onStop && (
        <button
          onClick={onStop}
          className="flex gap-2 items-center mt-2 px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded-md text-sm hover:bg-red-500 hover:text-white transition-all"
        >
          <Square className='w-4 h-4 fill-red-500'/>
          Stop Listening
        </button>
      )}    
    </div>
  )
}
