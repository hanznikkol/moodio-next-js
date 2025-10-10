import React from 'react'
import { FaSpotify } from 'react-icons/fa'

interface SpotifyButtonProps {
    onClickConnect: () => void
}

function SpotifyButton({ onClickConnect } : SpotifyButtonProps) {
  return (
      <button
          onClick={onClickConnect}
          className=" flex items-center gap-2 font-semibold duration-100 px-6 py-4 rounded-full bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer duration-200">
          <FaSpotify className='text-white w-5 h-5'/>
          Connect to Spotify
      </button>
  )
}

export default SpotifyButton