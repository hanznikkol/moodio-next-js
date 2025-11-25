import { Sparkles, Info } from "lucide-react"
import React from "react"
import HowToUse from "./FooterItems/HowToUse"

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full border-t border-black/20 dark:border-white/10 backdrop-blur-sm select-none z-10 text-black dark:text-white">
      <div className="max-w-screen-lg mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm">

        {/* Functional actions grouped */}
        <div className="flex items-center gap-3">
          {/* Powered By */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 animate-pulse" />
            <span className="truncate">Powered by Gemini AI</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 animate-pulse delay-150" />
          </div>

          {/* How To Use */}
          <HowToUse />
        </div>

        {/* Creator Info at the end */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-center opacity-80">
          <span>Created by</span>
          <a
            href="https://hanznikkol-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold hover:text-pink-500 dark:hover:text-pink-500 transition-colors duration-200"
          >
            <span className="flex items-center gap-0.5 animate-bounce">
              <span className="inline-block text-green-400">💻</span>
            </span>
            Hanz Nikkol Maas
            <span className="flex items-center gap-0.5 animate-bounce">
              <span className="inline-block text-green-400">💻</span>
            </span>
          </a>
          <span>| &copy; {new Date().getFullYear()}</span>
        </div>

      </div>
    </footer>
  )
}
