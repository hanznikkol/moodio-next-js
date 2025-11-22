"use client";

import { useSpotify } from '@/lib/spotifyLib/context/spotifyContext';
import { FaGithub } from 'react-icons/fa'
import React from 'react';
import ThemeToggleButton from '../../main_components/Buttons/ThemeToggleButton';
import { MoodioSoloLogo } from '@/app/svg/moodio_solo';
import ProfileMenu from './HeaderItems/ProfileMenu';
import HistorySheet from './HeaderItems/HistorySheet'; 
import { useMood } from '@/lib/history/context/moodHistoryContext';

export default function Header() {
  const { profile } = useSpotify();
  const { setSelectedAnalysis, setShowResults, setSelectedTrackID, setCurrentTrack, setMoodAnalysis, setShowPrompt } = useMood();

  return (
    <header className="fixed w-full top-0 right-0 flex items-center justify-between p-6 z-20">
      <a href="/" className="flex items-center">
        <MoodioSoloLogo className="h-8 w-auto md:h-10 xl:h-12" />
      </a>

      <div className='flex items-center gap-4'>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/hanznikkol/moodio-next-js"
          className="hover:scale-110 duration-100 hover:cursor-pointer"
        >
          <FaGithub size={24} className="text-black dark:text-white hover:text-orange-400"/>
        </a>

        {profile && <ProfileMenu />}

        <ThemeToggleButton />

        {profile && (
          <HistorySheet
            onSelectHistory={(analysis) => {
                // Reset Spotify playback state
                setSelectedTrackID(null);
                setCurrentTrack(null);
                setMoodAnalysis(null);
                setShowPrompt(false);
                // Show the selected history
                setSelectedAnalysis(analysis);
                setShowResults(true);
            }}
        />
        )}
      </div>
    </header>
  );
}
