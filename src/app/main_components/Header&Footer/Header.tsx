"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSpotify } from '@/lib/spotifyLib/context/spotifyContext';
import axios from 'axios';
import { History } from 'lucide-react'
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa'
import LoadingSpinner from '../LoadingSpinner';

export default function Header() {
  const { profile } = useSpotify();
  const userImage = profile?.images?.[0]?.url;
  const displayName = profile?.display_name || "User";
  const [history, setHistory] = useState<any[]>([]);
  const [hasFetch, setHasFetched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("spotifyToken");
    localStorage.removeItem("spotifyRefreshToken");
    window.location.href = "/";
  }

  const fetchHistory = async () => {
    if (hasFetch || !profile?.id) return
    setLoading(true);
    try {
        const res = await axios.get("/api/database_server/get_history", { params: { spotifyId: profile?.id } })
        setHistory(res.data)
        setHasFetched(true)
    } catch(err: any) {
        console.error("Error fetching history", err.response?.data || err.message)
    } finally {
        setLoading(false)
    }
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
        {profile && (
            <>
            <Sheet>
                <SheetTrigger onClick={fetchHistory}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-white/10"
                >
                    <History className="w-5 h-5" />
                    History
                </SheetTrigger>

                <SheetContent side='right' className='w-[400px] bg-black/90 text-white border-l border-white/10'>
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-white">
                            Song History
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea className='h-[85vh] w-full p-2'>
                        {/* Loading */}
                        {loading ? ( <LoadingSpinner message="Fetching your song history..." /> ) : 
                           history.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center">No history yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {history.map((item, i) => (
                                        <li key={i} className="border border-white/10 rounded-lg p-3 bg-white/5">
                                        <p className="font-medium">{item.songs?.name}</p>
                                        <p className="text-sm text-gray-400">{item.songs?.artist}</p>
                                        <p className="text-xs text-gray-500 mt-1 italic">{item.mood}</p>
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                    </ScrollArea>   
                </SheetContent>
            </Sheet>
            </>
        )}
       
    </header>   
  </>      
  )
}
