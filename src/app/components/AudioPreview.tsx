import React from 'react'

interface AudioPreviewProps {
    file: File;
}

function AudioPreview({file}: AudioPreviewProps) {
  const audioURL = URL.createObjectURL(file)
  return (
    <div className='w-full max-w-2xl'>
      <audio controls src={audioURL} className="w-full rounded-lg"></audio>
    </div>
  )
}

export default AudioPreview