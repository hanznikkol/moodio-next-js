import React from 'react'

interface LoadingSpinnerProps {
    message?: string
    color?: string
}

export default function LoadingSpinner({ message, color = "border-pink-500" } : LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-8 text-black dark:text-white">
      <div className={`w-8 h-8 lg:w-12 lg:h-12 border-4 ${color} border-t-transparent rounded-full animate-spin`}></div>
      <span>{message || "Loading..."}</span>
    </div>
  )
}