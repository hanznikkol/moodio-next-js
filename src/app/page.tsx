"use client";

import { useState } from "react";
import AudioPreview from "./main_components/AudioPreview";
import AudioUpload from "./main_components/AudioUpload";
import MoodBars from "./main_components/MoodBars";
import Recommendation from "./main_components/Recommendation";
import AnalyzeButton from "./main_components/Buttons/AnalyzeButton";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { toast } from "sonner";

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<{[key: string]: number} | null>(null);

  // Analyze 
  const handleAnalyze = () => {
      if (!file) {
        toast.warning("Please upload a song first 🎵");
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

  // Reset when the song removed
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
      
      <span className="text-white select-none">— or —</span>

      {/* Connect Spotify */}
      <SpotifyButton onClickConnect={() => {toast.info("Coming Soon")}}/>

      {/* Hides when Analyzing */}
      {!loading && !showResults && file && (
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
            {/* Divider */}
            <div className="flex flex-col items-center w-full max-w-md my-8">
              <div className="w-full h-px bg-white/20 mb-2"></div>
              <p className="text-white text-sm uppercase tracking-wide opacity-80 select-none">Mood Analysis</p>
            </div>
          
          <MoodBars analysis={moodAnalysis} />
          <Recommendation />
        </>
      )}
    </div>
  );
}
