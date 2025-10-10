import React from 'react'
import MoodBars from './sub_component/MoodBars'
import Recommendation from './sub_component/Recommendation'
import { MoodScores } from '@/lib/moodTypes';

interface MoodResultsProps {
  analysis: MoodScores;
}

export default function MoodResult({analysis}: MoodResultsProps) {
  return (
    <>
      <div className="flex flex-col items-center w-full max-w-md my-8">
        <div className="w-full h-px bg-white/20 mb-2"></div>
        <p className="text-white text-sm uppercase tracking-wide opacity-80 select-none">
          Mood Analysis Result
        </p>
      </div>

      <MoodBars analysis={analysis} />
      <Recommendation />
    </>
  )
}