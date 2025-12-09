import LoadingSpinner from '@/app/main_components/LoadingSpinner';
import { MergedHistoryItem } from '@/lib/history/historyTypes'
import { ArchiveRestore, Star, Trash } from 'lucide-react';
import React, { memo } from 'react'

interface HistoryItemProps {
    item: MergedHistoryItem;
    loadingItemId: string | null
    onClick: (item: MergedHistoryItem) => void;
    onDelete?: (item: MergedHistoryItem) => void;
    onArchive?: (item: MergedHistoryItem) => void;
    onFavorite?: (item: MergedHistoryItem, newValue: boolean) => void
    onRestore?: (item: MergedHistoryItem) => void
    showFavorite?: boolean
    showArchive?: boolean
    showRestore?: boolean
    showDelete?: boolean
}
function HistoryItem({
    item, 
    loadingItemId, 
    onClick, 
    onDelete, 
    onArchive, 
    onFavorite, 
    onRestore, 
    showFavorite = true, 
    showArchive= true, 
    showRestore = false, 
    showDelete = false
} : HistoryItemProps) {

  return (
    <li 
        className="group cursor-pointer border hover:border-cyan-400 hover:bg-white/10 transition-colors duration-200 rounded-lg p-3 bg-white/5 flex flex-col gap-1" 
        onClick={() => onClick(item)}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="font-medium">{item.songs?.name}</p>
                <p className="text-sm text-gray-400">{item.songs?.artist}</p>
                <p className="text-xs italic">{item.mood}</p>
                {item.count > 1 && (
                    <p className="text-xs text-cyan-400">analyzed {item.count}x consecutively</p>
                )}
            </div>

            <div className='flex items-center gap-2'>
                {/* Loading */}
                {loadingItemId === item.analyses_id && <LoadingSpinner color="border-cyan-400" size="small" />}

                {/* Favorites */}
                {showFavorite && onFavorite && (
                    <Star
                    className={`w-5 h-5 cursor-pointer transition-opacity opacity-100
                        ${item.is_favorite ? 'stroke-yellow-400 fill-yellow-400' : ' stroke-yellow-400 fill-none hover:fill-yellow-400'}    
                    `}
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite(item, !item.is_favorite);
                    }}
                    />
                )}

                {showArchive && onArchive && (
                    <Trash
                    className="w-5 h-5 cursor-pointer transition-opacity opacity-100 stroke-red-500 hover:fill-red-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        onArchive(item);
                    }}
                    />
                )}

                {showRestore && item.is_archived && onRestore && (
                    <ArchiveRestore
                    className="w-5 h-5 cursor-pointer stroke-green-500 hover:fill-green-500 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRestore(item);
                    }}
                    />
                )}

                
                {showDelete && onDelete && (
                    <Trash
                    className="w-5 h-5 cursor-pointer stroke-red-500 hover:fill-red-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                    }}
                    />
                )}
            </div>
            
        </div>
        {/* Date */}
        <p className="text-xs text-gray-400">
            Latest: {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "N/A"}
        </p>
    </li>
  )
}

export default memo(HistoryItem, (prevProps, nextProps) => {
    return (
        prevProps.item.analyses_id === nextProps.item.analyses_id &&
        prevProps.loadingItemId === nextProps.loadingItemId &&
        prevProps.item.is_favorite === nextProps.item.is_favorite &&
        prevProps.item.count === nextProps.item.count
    );
})