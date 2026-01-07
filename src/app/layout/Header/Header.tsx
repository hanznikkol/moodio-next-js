"use client";
import { useSpotify } from '@/lib/spotifyLib/context/spotifyContext';
import { FaGithub } from 'react-icons/fa'
import React, { useMemo, useState } from 'react';
import ThemeToggleButton from '../../main_components/Buttons/ThemeToggleButton';
import { MoodioSoloLogo } from '@/app/svg/moodio_solo';
import ProfileMenu from './HeaderItems/ProfileMenu';
import HistorySheet from './HeaderItems/History/HistorySheet'; 
import { useMood } from '@/lib/history/context/moodHistoryContext';
import ArchiveList from './HeaderItems/History/ArchiveList';
import { MergedHistoryItem } from '@/lib/history/historyTypes';
import { archiveItem, deleteHistoryItem, fetchArchivedHistory } from '@/lib/history/historyHelper';
import { ConfirmDialog } from '@/app/main_components/Buttons/ConfirmDialog';
import Link from 'next/link';

export default function Header() {
  const { profile, userId } = useSpotify();
  const { setSelectedAnalysis, setShowResults, setSelectedTrackID, setCurrentTrack, setMoodAnalysis, setShowPrompt } = useMood();
  const [loading, setLoading] = useState(false)
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  const [archivedItems, setArchivedItems] = useState<MergedHistoryItem[]>([])
  const [archiveFilterDate, setArchiveFilterDate] = useState<Date | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState<MergedHistoryItem | null>(null)
  const [historyItems, setHistoryItems] = useState<MergedHistoryItem[]>([]);
  
  const handleOpenArchive = async () => {
    setArchivedModalOpen(true);

    if (!userId) return;

    setLoading(true)
    try {
      const archived = await fetchArchivedHistory(userId);
      setArchivedItems(archived);
    } catch (err) {
      console.error("Failed to fetch archived items:", err);
    } finally{
      setLoading(false)
    }
  };

  
  const filteredArchivedItems = useMemo(() => 
    archivedItems.filter(item => {
      if (!archiveFilterDate) return true;
      return new Date(item.created_at) <= archiveFilterDate;
    }),
    [archivedItems, archiveFilterDate]
  );

  const handleDeleteClick = (item: MergedHistoryItem) => {
    setItemToConfirm(item);
    setConfirmDeleteOpen(true);
  }

  const handleRestoreClick = (item: MergedHistoryItem) => {
    setItemToConfirm(item)
    setConfirmRestoreOpen(true)
  }

  const handleConfirmRestore = async () => {
    if (!itemToConfirm || !userId) return

    try {
      await archiveItem(userId, itemToConfirm.analyses_id, false);
      setHistoryItems(prev => prev.map(h => h.analyses_id === itemToConfirm.analyses_id ? { ...h, is_archived: false } : h));
      setArchivedItems(prev => prev.filter(h => h.analyses_id !== itemToConfirm.analyses_id));
    } catch(err) {
        console.error("Failed to restore archived item:", err);
    } finally {
      setConfirmRestoreOpen(false)
      setItemToConfirm(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToConfirm || !userId) return;

    try {
      await deleteHistoryItem(userId, itemToConfirm.analyses_id);
      setHistoryItems(prev => prev.filter(h => h.analyses_id !== itemToConfirm.analyses_id));
      setArchivedItems(prev => prev.filter(h => h.analyses_id !== itemToConfirm.analyses_id));
    } catch (err) {
      console.error("Failed to delete item permanently:", err);
    } finally {
      setConfirmDeleteOpen(false);
      setItemToConfirm(null);
    }
  };

  return (
  <>
    <header className="fixed w-full top-0 right-0 flex items-center justify-between p-6 z-20">
      {/* Left */}
      <Link href="/" className="flex items-center">
        <MoodioSoloLogo className="h-8 w-auto md:h-10 xl:h-12" />
      </Link>
      {/* Right */}
      <div className='flex items-center gap-4'>

        {/* History */}
        {profile && userId && (
          <HistorySheet
            supabaseUserId={userId}
            onSelectHistory={(analysis) => {
              setSelectedTrackID(null);
              setCurrentTrack(null);
              setMoodAnalysis(null);
              setShowPrompt(false);
              setSelectedAnalysis(analysis);
              setShowResults(true);
            }}
          />
        )}
                
        {/* Theme */}
        <ThemeToggleButton />

        {/* Profile */}
        {profile && <ProfileMenu onOpenArchived={handleOpenArchive}/>}

        {/* Github */}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/hanznikkol/moodio-next-js" className="hover:scale-110 duration-100 hover:cursor-pointer">
          <FaGithub size={24} className="text-black dark:text-white hover:text-orange-400 dark:hover:text-orange-400"/>
        </a>

      </div>
    </header>

    <ArchiveList
        open={archivedModalOpen}
        onOpenChange={setArchivedModalOpen}
        archivedItems={filteredArchivedItems}
        onRestore={handleRestoreClick}
        onDeletePermanently={handleDeleteClick}
        onClickItem={() => {}}
        loading={loading}
    />

    <ConfirmDialog
      open={confirmDeleteOpen}
      title="Delete permanently?"
      description={`Are you sure you want to delete "${itemToConfirm?.songs.name}"? This action cannot be undone.`}
      onConfirm={handleConfirmDelete}
      confirmVariant="destructive"
      onCancel={() => setConfirmDeleteOpen(false)}
    />

    <ConfirmDialog
      open={confirmRestoreOpen}
      title="Restore item?"
      description={`Are you sure you want to restore "${itemToConfirm?.songs.name}"?`}
      confirmLabel='Restore'
      className= "bg-green-500 text-white"
      onConfirm={handleConfirmRestore}
      onCancel={() => setConfirmRestoreOpen(false)}
    />
  </>
  );
}
