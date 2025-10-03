"use client";

import { useState } from "react";
import AudioPreview from "./components/AudioPreview";
import AudioUpload from "./components/AudioUpload";
import MoodBars from "./components/MoodBars";
import Recommendation from "./components/Recommendation";
import AnalyzeButton from "./components/AnalyzeButton";

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<{[key: string]: number} | null>(null);

  const handleAnalyze = () => {
      if (!file) {
        alert("Please upload a song first 🎵");
        return; 
      }
      setLoading(true)
      setTimeout(() => {
          const analysis = {
            happy: Math.random(),
            sad: Math.random(),
            dreamy: Math.random(),
            energetic: Math.random(),
            chill: Math.random(),
          };  
          console.log("Analyzing file:", file.name);
          setMoodAnalysis(analysis);
          setLoading(false);
          setShowResults(true);
      }, 1500)
  };

  const handleReset = () => {
    setMoodAnalysis(null)
    setShowResults(false)
    setLoading(false)
  }
  
  return (
    <div className="flex flex-col items-center p-8 w-full gap-8">
      {/* Header */}
      <div className="flex items-center gap-4 flex-col select-none">
        <h1 className="text-6xl font-bold text-white">Moodio</h1>
        <p className="text-white text-center">Upload a song to see its mood</p>
      </div>

      {/* Upload Files */}
      <AudioUpload file={file} setFile={setFile} onReset={handleReset}/>
      {/* Audio Preview */}
      {file && <AudioPreview file={file}/>}
      
      {/* Hides when Analyzing */}
      {!loading && !showResults && (
        <AnalyzeButton onAnalyze={handleAnalyze}/>
      )}
      
      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-white">
          <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing...</span>
        </div>
      )}

      {/* Result Analysis */}
      {file && showResults && moodAnalysis &&(
        <>
          <MoodBars analysis={moodAnalysis} />
          <Recommendation />
        </>
      )}
    </div>
  );
}
