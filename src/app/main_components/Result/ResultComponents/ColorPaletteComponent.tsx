import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React from 'react'

interface ColorPaletteComponentProps {
    colors: string[]
}

function ColorPaletteComponent({colors}: ColorPaletteComponentProps) {
  return (
    <TooltipProvider>
        <div className="flex flex-wrap gap-2 justify-center">
            {colors.map((color) => (
                <Tooltip key={color}>
                    <TooltipTrigger asChild>
                        <div
                            style={{ backgroundColor: color }}
                            className="w-8 h-8 rounded-md shadow-sm border border-gray-300 dark:border-white/20"
                        />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{color}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    </TooltipProvider>
  )
}

export default ColorPaletteComponent