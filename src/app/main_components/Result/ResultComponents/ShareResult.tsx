import React from 'react'
import { FaFacebookSquare, FaFacebookMessenger, FaInstagram } from 'react-icons/fa'
import { FaSquareXTwitter } from 'react-icons/fa6'
import CopyClipboard from '../../Icons/CopyClipboard'

function ShareResult() {
  return (
    <div className="w-full"> 
        <h3 className="text-lg font-semibold mb-3 text-center">Share it with your friends</h3>
        
        <div className="flex justify-center gap-8 items-center text-2xl">
            <FaFacebookSquare className="text-[#1877F2] hover:scale-110 transition-transform cursor-pointer" />
            <FaFacebookMessenger className="text-[#0084FF] hover:scale-110 transition-transform cursor-pointer" />
            <FaInstagram className="text-[#E1306C] hover:scale-110 transition-transform cursor-pointer" />
            <FaSquareXTwitter className="text-black dark:text-white hover:scale-110 transition-transform cursor-pointer"/>
            <CopyClipboard textToCopy=""/>
        </div>

    </div>
  )
}

export default ShareResult