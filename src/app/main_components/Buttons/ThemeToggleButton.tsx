import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'

export default function ThemeToggleButton() {
  const {theme, setTheme} = useTheme()
  const  [mounted, setMounted] = useState(false)
  // Avoid SSR hydration mismatch
  useEffect(() => {setMounted(true)}, [])
  
  if (!mounted) return null

  const isDark = theme === "dark"
  return (
    <>
     <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`
          w-10 h-10 p-0 relative bg-white/20 border-yellow-500 dark:border-cyan-500 
          hover:bg-white/50 
          transition-colors hover:cursor-pointer
        `}
      >
        <Sun className={`absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2
              transition-all duration-300 ${isDark ? "opacity-0 scale-0" : "opacity-100 scale-100"} text-yellow-500`} />
        <Moon className={`absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2
              transition-all duration-300 ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"} text-cyan-400`} />
      </Button>

    </>
  )
}

