import React from 'react';
import { FaFacebookSquare, FaFacebookMessenger} from 'react-icons/fa';
import CopyClipboard from '../../Icons/CopyClipboard';

interface ShareResultProps {
  shareUrl: string | null;
}

function ShareResultIcons({ shareUrl }: ShareResultProps) {
  if (!shareUrl) return null; // Hide if no URL

  // Encode the URL for sharing
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    messenger: `fb-messenger:/share/?link=${encodedUrl}`,
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3 text-center">Share it with your friends</h3>

      <div className="flex justify-center gap-8 items-center text-2xl">
        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
          <FaFacebookSquare className="text-[#1877F2] hover:scale-110 transition-transform cursor-pointer" />
        </a>

        <a href={shareLinks.messenger} target="_blank" rel="noopener noreferrer">
          <FaFacebookMessenger className="text-[#0084FF] hover:scale-110 transition-transform cursor-pointer" />
        </a>

        {/* Copy to clipboard */}
        <CopyClipboard textToCopy={shareUrl} />
      </div>
    </div>
  );
}

export default ShareResultIcons;
