import React from 'react'

interface LoadingSpinnerProps {
    message?: string
    color?: string
    width?: string
    height?: string
    size?: 'small' | 'medium' | 'large'
}

export default function LoadingSpinner({ message, color = "border-pink-500", size = 'medium' } : LoadingSpinnerProps) {
  let dimension = "w-8 h-8 lg:w-12 lg:h-12 border-4";

  if (size === 'small') dimension = "w-4 h-4 border-2";
  if (size === 'large') dimension = "w-12 h-12 border-4 lg:w-16 lg:h-16";

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${size === 'small' ? 'mt-0' : 'mt-8'} text-black dark:text-white`}>
      <div className={`${dimension} ${color} border-t-transparent rounded-full animate-spin`}></div>
      {size !== 'small' && <span>{message || "Loading..."}</span>}
    </div>
  )
}
