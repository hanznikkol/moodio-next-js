import { Bolt, Zap } from 'lucide-react'
import React from 'react'

function AnalyzeButton({onAnalyze}: {onAnalyze: () => void}) {
  
  return (
    <>
    {/* Button triggers input */}
     <button
      onClick={onAnalyze}
      className=" group flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white
        bg-gray-700 hover:shadow-[0_0_10px_rgba(255,100,150,0.7),0_0_15px_rgba(100,200,255,0.6),0_0_20px_rgba(150,255,150,0.5)]
        transition-all duration-200 hover:scale-110 hover:cursor-pointer
      "
    >
      <Zap className="transition-colors duration-300 group-hover:text-pink-400" />
      Analyze
    </button>
    </>
  )
}

export default AnalyzeButton