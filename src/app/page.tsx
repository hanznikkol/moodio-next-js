"use client";

import { useState } from "react";
import AudioPreview from "./components/AudioPreview";
import AudioUpload from "./components/AudioUpload";
import MoodBars from "./components/MoodBars";
import Recommendation from "./components/Recommendation";

export default function Home() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className="flex flex-col items-center p-8 w-full gap-8">
      <div className="flex items-center gap-4 flex-col">
        <h1 className="text-6xl font-bold text-white">Moodio</h1>
        <p className="text-white text-center">Upload a song to see its mood</p>
      </div>
      <AudioUpload file={file} setFile={setFile}/>
      {file && <AudioPreview file={file}/>}
      <MoodBars/>
      <Recommendation/>
    </div>
  );
}
