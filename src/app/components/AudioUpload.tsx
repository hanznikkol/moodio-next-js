"use client";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function AudioUpload() {

const [fileName, setFileName] = useState<string | null>(null)

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFileName(e.target.files[0].name)
    }
}

const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFileName(e.dataTransfer.files[0].name)
    }
}

const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
}
return (
    <>
    <div className="w-full max-w-lg p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center justify-center text-white border-2 border-dashed border-white/30 hover:border-white/50 transition-colors"
        onDrop={handleDrop}
        onDrag={handleDragOver}
    > 
        {/* Drag text */}
        <p className="mb-4 text-center">
            {fileName ? `Selected: ${fileName}` : "Drag & drop a song here or click below"}
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
            {fileName ? "Change File" : "Select / Upload"}
        </label>
    </div>
    </>
)
}