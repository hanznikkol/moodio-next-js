"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSpotify } from '@/lib/spotifyLib/context/spotifyContext';
import { History } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
export default function Header() {
  const { profile } = useSpotify();
  const userImage = profile?.images?.[0]?.url;
  const displayName = profile?.display_name || "User";

  const handleLogout = () => {
    localStorage.removeItem("spotifyToken");
    localStorage.removeItem("spotifyRefreshToken");
    window.location.href = "/";
  }

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

        {profile && (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* User Profile */}
                        <Avatar className="w-8 h-8 border-2 border-white/20 hover:cursor-pointer hover:border-white/50 duration-200">
                            <AvatarImage src={userImage} alt="User Avatar" />
                            {/* User Initials */}
                            <AvatarFallback>
                                {displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    
                     <DropdownMenuContent align="end" className="bg-black/90 text-white border border-white/10">
                        {/* Display Name */}
                        <div className="px-4 py-2 border-b border-white/10">
                            <p className="font-medium">{displayName}</p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10 my-1" />

                        {/* Logout */}
                        <DropdownMenuItem onClick={handleLogout} className="hover:cursor-pointer data-[highlighted]:bg-red-500 data-[highlighted]:text-white  focus:bg-red-500  focus:text-white  transition-colors hover:text-white">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        )}
        
        {/* History */}
        <button 
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-white/10">
            <History className="w-5 h-5"/>
            History
        </button>
       
    </header>   
  </>      
  )
}
