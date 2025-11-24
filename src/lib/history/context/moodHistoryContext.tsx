"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AnalysisResult } from "@/lib/analysisMoodLib/analysisResult";
import { MergedHistoryItem } from "../historyTypes";

interface MoodContextType {
  // History analysis
  selectedAnalysis: AnalysisResult | null;
  setSelectedAnalysis: (analysis: AnalysisResult | null) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;

  // Spotify playback state
  selectedTrackID: string | null;
  setSelectedTrackID: (id: string | null) => void;
  currentTrack: { name: string; artists: string } | null;
  setCurrentTrack: (track: { name: string; artists: string } | null) => void;
  moodAnalysis: AnalysisResult | null;
  setMoodAnalysis: (analysis: AnalysisResult | null) => void;
  showPrompt: boolean;
  setShowPrompt: (show: boolean) => void;
}


const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedTrackID, setSelectedTrackID] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{ name: string; artists: string } | null>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<MergedHistoryItem[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <MoodContext.Provider
      value={{
        selectedAnalysis,
        setSelectedAnalysis,
        showResults,
        setShowResults,  
        selectedTrackID,
        setSelectedTrackID,
        currentTrack,
        setCurrentTrack,
        moodAnalysis,
        setMoodAnalysis,
        showPrompt,
        setShowPrompt,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) throw new Error("useMood must be used within MoodProvider");
  return context;
};
