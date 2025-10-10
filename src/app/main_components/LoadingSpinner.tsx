import React from 'react'

interface LoadingSpinnerProps {
    message: string
}

export default function LoadingSpinner({ message } : LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-8 text-white">
      <div className="w-12 h-12 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
      <span>{message || "Loading..."}</span>
    </div>
  )
}