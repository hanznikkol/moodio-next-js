import { Sparkles } from 'lucide-react'
import React from 'react'

export default function Footer() {
  return (
    <>
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 w-full py-4 border-t border-black/20 dark:border-white/10 text-black dark:text-white backdrop-blur-sm select-none z-10 flex justify-center items-center gap-2">
            <span>Created by</span>
            <a
                href="https://hanznikkol-portfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-black dark:text-white text-sm font-bold hover:text-pink-400 dark:hover:text-pink-400 transition-colors select-none duration-200"
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

            {/* Powered By */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Powered by Gemini AI</span>
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse delay-150" />
            </div>
        </footer>
    </>
  )
}
