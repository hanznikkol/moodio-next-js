"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSpotify } from '@/lib/spotifyLib/context/spotifyContext';
import axios from 'axios';
import { History } from 'lucide-react'
import { useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa'
import LoadingSpinner from '../LoadingSpinner';
import React from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import ThemeToggleButton from '../Buttons/ThemeToggleButton';

export default function Header() {
  const { profile } = useSpotify();
  const userImage = profile?.images?.[0]?.url;
  const displayName = profile?.display_name || "User";
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false)


  const handleLogout = () => {
    localStorage.removeItem("spotifyToken");
    localStorage.removeItem("spotifyRefreshToken");
    window.location.href = "/";
  }

  const groupDateHistory = history.reduce<Record<string, typeof history>>((acc, item) => {
    const date = item.created_at.split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(item);
    return acc
  }, {})

  const sortedDate = Object.keys(groupDateHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  //Fetch History   
  useEffect(() => {
    if (!profile?.id) return;

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/database_server/get_history", {
                params: { spotifyId: profile.id },
            });
            setHistory(res.data)
            setLoading(false)
        } catch (err: any) {
            console.error("Error fetching history", err.response?.data || err.message);
            setLoading(false);
        } finally {
            setLoading(false)
        }
    };

    fetchHistory();
    
    const channel = supabase
        .channel('realtime-analyses')
        .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'analyses'}, 
            (payload: { new: any; }) => {
                console.log('New analysis:', payload.new);
                setHistory((prev) => [payload.new, ...prev]);
            })
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    };
  }, [profile?.id])

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
            <FaGithub size={24} className="text-black dark:text-white hover:text-orange-400"/>
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

        <ThemeToggleButton />
        
        {/* History */}
        {profile && (
            <>
            <Sheet>
                <SheetTrigger
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/50 px-3 py-2 text-black dark:text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-black/20 dark:border-white/10"
                >
                    <History className="w-5 h-5" />
                    History
                </SheetTrigger>

                <SheetContent side='right' className='w-[400px] bg-white/90 dark:bg-black/90 text-black dark:text-white border-l border-white/10'>
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-black dark:text-white">
                            Song History
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea className='h-[85vh] w-full p-2'>
                        {/* Loading */}
                        {loading ? ( <LoadingSpinner color='border-cyan-400' /> ) : 
                           history.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center">No history yet.</p>
                            ) : (
                                <div className='space-y-6'>
                                    {sortedDate.map((date) => (
                                        <React.Fragment key={date}>
                                            {/* Date Header */}
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                                    {new Date(date).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* Songs for this date */}
                                            <ul className='space-y-3'>
                                               {groupDateHistory[date].map((item) => (
                                                    <li
                                                        key={item.analyses_id}
                                                        className="border border-gray-300 dark:border-white/10 rounded-lg p-3 bg-white/5"
                                                    >
                                                        <p className="font-medium">{item.songs?.name}</p>
                                                        <p className="text-sm text-gray-400">{item.songs?.artist}</p>
                                                        <p className="text-xs text-gray-500 mt-1 italic">{item.mood}</p>
                                                        <p className="text-xs text-gray-400 mt-1"> {new Date(item.created_at).toLocaleTimeString()}</p>
                                                    </li>
                                               ))}
                                            </ul>
                                        </React.Fragment>
                                    ))}
                                </div>
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
