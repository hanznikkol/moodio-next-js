"use client";

import { useEffect, useState } from "react";
import AudioPreview from "./main_components/AudioPreview";
import AudioUpload from "./main_components/AudioUpload";
import MoodBars from "./main_components/MoodBars";
import Recommendation from "./main_components/Recommendation";
import AnalyzeButton from "./main_components/Buttons/AnalyzeButton";
import SpotifyButton from "./main_components/Buttons/SpotifyButton";
import { moodAnalyzer , type MoodScores } from "@/lib/moodAnalyzer";
import { toast } from "sonner";

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodScores | null>(null);

  // Auto Analyze after uploading files
  useEffect(() => {
    if (!file) return;

    setLoading(true);
    setMoodAnalysis(null);


    moodAnalyzer(file, (scores) => {
    setMoodAnalysis(scores);
    setLoading(false);
    setShowResults(true);
      }).catch((err) => {
        console.log(err)
        toast.error("Failed to analyze the song")
        setLoading(false);
      })

  }, [file])

  // Reset when the song removed
  const handleReset = () => {
    setMoodAnalysis(null);
    setLoading(false);
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
      
      {/* Mood Analyze Result Section */}
      {loading ? 
      // Loading
      (
        <div className="flex items-center gap-2 text-white">
          <div className="w-5 h-5 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing... Please Wait!</span>
        </div>
      ): 
      // Show Result
      (
        file && showResults && moodAnalysis && (
        <>
          <div className="flex flex-col items-center w-full max-w-md my-8">
            <div className="w-full h-px bg-white/20 mb-2"></div>
            <p className="text-white text-sm uppercase tracking-wide opacity-80 select-none">Mood Analysis Result</p>
          </div>
          
          <MoodBars analysis={moodAnalysis} />
          <Recommendation />
        </>
      ))}

    </div>
  );
}
