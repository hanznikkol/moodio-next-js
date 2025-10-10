'use client'
import { Tooltip } from "@heroui/tooltip";
import { moods } from "@/lib/moodTypes";
import type { MoodScores } from "@/lib/moodTypes";

interface MoodBarsProps {
  analysis: MoodScores | null
}

export default function MoodBars ({analysis} : MoodBarsProps) {
  if(!analysis) {
    return (
      <div className="w-full max-w-md flex flex-col space-y-4 select-none">
        {moods.map((mood) => (
          <div key={mood.id} className="flex items-center gap-2">
            <span>{mood.emoji}</span>
            <div className="flex-1 bg-white/10 rounded-full h-4 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col space-y-4 select-none">
      {moods.map((mood) => {
        const confidence = analysis?.[mood.id] ?? 0
        const percent = Math.round(confidence * 100)
        const widthPercent = `${Math.round(confidence * 100)}%`;
        return (
          <Tooltip key={mood.id} 
            content={`${mood.label}: ${percent}%`} 
            delay={0}
            placement="top" 
            classNames={{
                base: 'bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg',
            }}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <span>{mood.emoji}</span>

              <div className="flex-1 bg-white/20 rounded-full h-4">
                <div
                  className="h-4 rounded-full"
                  style={{ width: widthPercent, backgroundColor: mood.color }}
                />
              </div>
            </div>
          </Tooltip>  
        )
      })}
    </div>
  )
}