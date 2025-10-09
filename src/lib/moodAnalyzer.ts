"use client"

import Meyda, { MeydaFeaturesObject } from "meyda"
import { RefObject } from "react"

export type Mood = "happy" | "sad" | "dreamy" | "energetic" | "chill";
export type MoodScores = Record<Mood, number>;

//Passes audio ref and mood analysis
export const moodAnalyzer = async (
    file: File, 
    setMoodAnalysis: (scores: (MoodScores)) => void ) => {
    if (!file) return

    // Decode Audio Buffer
    const arrayBuffer = await file.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    const rawData = audioBuffer.getChannelData(0) // analyze first channel
    const bufferSize = 512

    Meyda.sampleRate = audioContext.sampleRate;
    Meyda.bufferSize = bufferSize;

    const moods: MoodScores = {
        happy: 0,
        sad: 0,
        energetic: 0,
        dreamy: 0,
        chill: 0
    };

    const frameCount = Math.floor(rawData.length / bufferSize)
     
    //Loop every frame safely
    for (let i = 0; i < frameCount; i++) {
        const frame = rawData.slice(i * bufferSize, (i + 1) * bufferSize)
        const features = Meyda.extract(
            ["rms", "spectralCentroid", "mfcc", "zcr", "chroma"],
            frame
        );
        

        if (
            !features ||
            typeof features.rms !== "number" ||
            typeof features.spectralCentroid !== "number" ||
            typeof features.zcr !== "number" ||
            !Array.isArray(features.mfcc) ||
            !Array.isArray(features.chroma)
            ) {
            continue; // skip invalid frames
        }
        
        // skip silent parts
        if (features.rms < 0.0001) continue;

        // Safely normalize features
        const rmsNorm = Math.min((features.rms ?? 0) / 1, 1);
        const centroidNorm = Math.min((features.spectralCentroid ?? 0) / 5000, 1);
        const zcrNorm = Math.min((features.zcr ?? 0) / 0.1, 1);
        const mfccNorm = Math.min(((features.mfcc?.[0] ?? 0) / 100), 1);
        const chromaVar = features.chroma?.length
        ? Math.max(...features.chroma) - Math.min(...features.chroma)
        : 0;
        const chromaNorm = Math.min(chromaVar / 0.2, 1);
        
        // Mood weights
        moods.happy += 0.5 * rmsNorm + 0.5 * centroidNorm;
        moods.sad += 0.5 * (1 - rmsNorm) + 0.5 * (1 - centroidNorm);
        moods.energetic += 0.4 * rmsNorm + 0.4 * zcrNorm + 0.2 * centroidNorm;
        moods.dreamy += 0.5 * mfccNorm + 0.3 * rmsNorm + 0.2 * chromaNorm;
        moods.chill += 0.3 * (1 - rmsNorm) + 0.3 * (1 - zcrNorm) + 0.4 * (1 - centroidNorm);
    }


     // Normalize & clean up
    Object.keys(moods).forEach((key) => {
        const mood = key as Mood;
        const score = moods[mood] / frameCount;
        moods[mood] = isNaN(score) ? 0 : Number(score.toFixed(3));
    });
    setMoodAnalysis(moods)
}