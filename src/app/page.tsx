"use client";

import { useState } from "react";
import AudioPreview from "./components/AudioPreview";
import AudioUpload from "./components/AudioUpload";
import MoodBars from "./components/MoodBars";
import Recommendation from "./components/Recommendation";
import AnalyzeButton from "./components/AnalyzeButton";

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setShowResults(true);
  };
  
  //static data
  //add real data later
  const moodAnalysis = {
    happy: .70,
    sad: .15,
    dreamy: .40,
    energetic: .85,
    chill: .55,
  };

  return (
    <div className="flex flex-col items-center p-8 w-full gap-8">
      {/* Header */}
      <div className="flex items-center gap-4 flex-col select-none">
        <h1 className="text-6xl font-bold text-white">Moodio</h1>
        <p className="text-white text-center">Upload a song to see its mood</p>
      </div>
      {/* Upload Files */}
      <AudioUpload file={file} setFile={setFile}/>
      {/* Audio Preview */}
      {file && <AudioPreview file={file}/>}

      <AnalyzeButton onAnalyze={() => {}}/>
      {/* Result Analysis */}
      {file && showResults && (
        <>
          <MoodBars analysis={moodAnalysis} />
          <Recommendation />
        </>
      )}
    </div>
  );
}
