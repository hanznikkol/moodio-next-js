"use client";
import { Upload } from "lucide-react";
import { useState } from "react";

interface AudioUploadProps {
    file: File | null;
    setFile: (file: File | null) => void
}

export default function AudioUpload({ file, setFile } : AudioUploadProps) {

const [isDragging, setIsDragging] = useState(false)

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        if (!file.type.startsWith("audio/")) {
            alert("Only audio files are allowed! 🎵")
            e.target.value = ""
            return
        }
        setFile(file)
    }
}

const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (!file.type.startsWith("audio/")) {
            alert("Only audio files are allowed! 🎵")
            return
        }
        setFile(file)
    }
}

const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if(!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
}

const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
}

return (
    <>
    <div className="relative w-full max-w-2xl p-12 bg-white/10 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center justify-center text-white border-2 border-dashed border-white/30 hover:border-white/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
    > 
        {/* Drop your file */}
        {isDragging && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <p className="text-white text-lg font-medium">Drop your file here</p>
            </div>
        )}

        {/* Drag text */}
        <p className="mb-4 text-center select-none">
            {file?.name ? `Selected File: ${file?.name}` : "Drag & drop a song here or click below"}
        </p>

        <input 
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
        />

        {/* Center button with icon */}
        <label
            htmlFor="audio-upload"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition text-white font-medium z-10"
        >
            <Upload className="w-5 h-5"/>
            {file ? "Change File" : "Select / Upload"}
        </label>
    </div>
    </>
)}