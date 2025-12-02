import React from 'react'
import { FaCopy } from 'react-icons/fa6';
import { toast } from 'sonner';

interface CopyClipBoardProps {
    textToCopy: string
}
function CopyClipboard({textToCopy}: CopyClipBoardProps) {
  const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(textToCopy);
        toast.success("Link copied to clipboard!"); // optional
    } catch(err) {
      toast.error("Failed to copy link.");
    }
  }

  return (
    <FaCopy
      className="cursor-pointer transition-colors text-gray-700 dark:text-white hover:scale-110 "
      onClick={handleCopy}
      title="Copy link"
    />
  )
}

export default CopyClipboard