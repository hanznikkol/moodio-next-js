import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MergedHistoryItem } from '@/lib/history/historyTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import HistoryItemComponent from './HistoryItemComponent';
import { DialogDescription } from '@radix-ui/react-dialog';

interface ArchiveListProps {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  archivedItems: MergedHistoryItem[],
  onRestore: (item: MergedHistoryItem) => void,
  onDeletePermanently: (item: MergedHistoryItem) => void
  onClickItem: (item: MergedHistoryItem) => void,
  loadingItemId?: string | null
}

function ArchiveList({open, onOpenChange, archivedItems, onRestore, onDeletePermanently, onClickItem, loadingItemId}: ArchiveListProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[80vh] max-w-lg p-4 flex flex-col'>
            <DialogDescription></DialogDescription>
            <DialogHeader>
                <DialogTitle>Archived Items</DialogTitle>
            </DialogHeader>

            <ScrollArea className="mt-2 flex-1 overflow-y-auto">
                {archivedItems.length === 0 ? (
                    <p className="text-center text-gray-400">No archived items.</p>
                ) : (
                    <ul className='space-y-3'>
                        {archivedItems.map(item => (
                            <HistoryItemComponent
                                key={item.analyses_id}
                                item={item}
                                loadingItemId={loadingItemId ?? null}
                                onClick={() => onClickItem(item)}
                                onDelete={() => onDeletePermanently(item)}
                                onRestore={() => onRestore(item)} 
                                showFavorite={false}   
                                showArchive={false}    
                                showRestore={true}    
                                showDelete={true}
                            />
                        ))}
                    </ul>
                )}
            </ScrollArea>
        </DialogContent>
    </Dialog>
  )
}

export default ArchiveList