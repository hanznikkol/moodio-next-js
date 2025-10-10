// lib/moodTypes.ts
export type Mood = "happy" | "sad" | "dreamy" | "energetic" | "chill";

export type MoodScores = Record<Mood, number>;

export const moods: { id: Mood; label: string; color: string; emoji: string }[] = [
  { id: "happy", label: "Happy", color: "#facc15", emoji: "😄" },
  { id: "sad", label: "Sad", color: "#60a5fa", emoji: "😢" },
  { id: "dreamy", label: "Dreamy", color: "#a78bfa", emoji: "☁️" },
  { id: "energetic", label: "Energetic", color: "#f97316", emoji: "⚡" },
  { id: "chill", label: "Chill", color: "#2dd4bf", emoji: "😎" },
];