import React from 'react'
import SpotifyButton from './Buttons/SpotifyButton'

const openSpotify = () => window.open("https://open.spotify.com", "_blank")

export default function PlayPrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-4 text-white text-center p-4 rounded-lg">
        <p className="text-lg mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 select-none">
            Please play any song on Spotify to track mood
        </p>
        <SpotifyButton
            onClick={openSpotify}
            label="Open Spotify & Play Music"
        />    
    </div>
  )
}
