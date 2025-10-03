import React from 'react'

interface AudioPreviewProps {
    file: File;
}

function AudioPreview({file}: AudioPreviewProps) {
  // Get the file url
  const audioURL = URL.createObjectURL(file)
  return (
    // Preview Audio
    <div className='w-full max-w-md'>
      <audio controls src={audioURL} className="w-full rounded-lg"></audio>
    </div>
  )
}

export default AudioPreview