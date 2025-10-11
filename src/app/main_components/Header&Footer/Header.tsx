import { History } from 'lucide-react'
import React from 'react'
import { FaGithub } from 'react-icons/fa'

export default function Header() {
  return (
  <>
     {/* Header */}
    <header className="fixed top-0 right-0 flex items-center gap-4 p-6 z-20">
        {/* Github Repo */}
        <a className="hover:scale-110 duration-100 hover:cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/hanznikkol/moodio-next-js"
        >
            <FaGithub size={24} className="text-white hover:text-orange-400"/>
        </a>

        <button 
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-white/10">
            <History className="w-5 h-5"/>
            History
        </button>
    </header>
  </>
         
  )
}
