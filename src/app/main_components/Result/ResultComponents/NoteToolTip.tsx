import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React from 'react'

interface NoteToolTipProps {
    note: string
}

function NoteToolTip({note}: NoteToolTipProps) {
  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-gray-400 dark:text-gray-300 cursor-help text-sm">🛈</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{note}</p>
            </TooltipContent>
          </Tooltip>

    </TooltipProvider>
  )
}

export default NoteToolTip