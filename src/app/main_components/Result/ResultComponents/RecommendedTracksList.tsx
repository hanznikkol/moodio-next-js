import { RecommendedTrack } from '@/lib/analysisMoodLib/analysisResult'
import React from 'react'
import SpotifyLinkButton from '../../Buttons/SpotifyLinkButton';
import NoteToolTip from './NoteToolTip';
import { cn } from '@/lib/utils';
import { Music } from 'lucide-react';
import Image from 'next/image';

interface RecommendedTracksListProps{
    tracks: RecommendedTrack[]
}

function RecommendedTracksList({tracks}: RecommendedTracksListProps) {
  if (!tracks?.length) return null;
  return (
    <div className="w-full mt-4">
        <h3 className="text-lg font-semibold mb-3 text-center">Top Recommended Tracks</h3>

        {/* Recommended List */}
        <div className="bg-gray-100 dark:bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-sm"> 
            <div>
            <ul className="flex flex-col gap-2">
                {tracks.slice(0, 5).map((track, index, arr) => (
                <li key={track.name || track.artist}
                    className={cn("flex items-center gap-3 p-3 transition-colors",
                        index !== arr.length - 1 && "border-b border-black/10 dark:border-white/10"
                    )}
                >
                    {/* Album */}
                    {track.image ? (
                        <Image src={track.image} alt={track.name} width = {48} height={48} className="rounded-md object-cover flex-shrink-0" priority={false} />
                    ) : (
                    <div className="w-9 h-9 sm:w-12 sm:h-12  rounded-md bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 text-gray-500 dark:text-white/50" />
                    </div>
                    )}

                    {/* Track Info */}
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900 dark:text-white truncate">{track.name}</span>
                            {track.note && <NoteToolTip note={track.note}/>}
                        </div>
                    
                        <span className="text-xs text-gray-600 dark:text-white/70 truncate">{track.artist}</span>
                    </div>
                    
                    {/* Recommendation Spotify Links */}
                    <SpotifyLinkButton
                        trackUri= {track.uri}
                        trackName= {track.name}
                        trackArtist={track.artist}
                    />
                </li>
                ))}
            </ul>
            </div>
        </div>
        </div>
  )
}

export default RecommendedTracksList