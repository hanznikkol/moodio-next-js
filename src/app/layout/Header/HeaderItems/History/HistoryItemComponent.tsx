import LoadingSpinner from '@/app/main_components/LoadingSpinner';
import { MergedHistoryItem } from '@/lib/history/historyTypes'
import React, { memo } from 'react'

interface HistoryItemProps {
    item: MergedHistoryItem;
    loadingItemId: string | null
    onClick: (item: MergedHistoryItem) => void;
    onDelete?: (item: MergedHistoryItem) => void;
}
function HistoryItem({item, loadingItemId, onClick, onDelete} : HistoryItemProps) {
  return (
    <li 
        className="group cursor-pointer border hover:border-cyan-400 hover:bg-white/10 transition-colors duration-200 rounded-lg p-3 bg-white/5 flex flex-col gap-1" 
        onClick={() => onClick(item)}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium">{item.songs?.name}</p>
                <p className="text-sm text-gray-400">{item.songs?.artist}</p>
                <p className="text-xs italic">{item.mood}</p>
                {item.count > 1 && (
                    <p className="text-xs text-cyan-400">analyzed {item.count}x consecutively</p>
                )}
            </div>
            {loadingItemId === item.analyses_id && <LoadingSpinner color="border-cyan-400" size="small" />}
        </div>
        {/* Date */}
        <p className="text-xs text-gray-400">
            Latest: {new Date(item.latestTime).toLocaleTimeString()}
        </p>
    </li>
  )
}

export default memo(HistoryItem, (prevProps, nextProps) => {
    return (
        prevProps.item.analyses_id === nextProps.item.analyses_id &&
        prevProps.loadingItemId === nextProps.loadingItemId
    );
})