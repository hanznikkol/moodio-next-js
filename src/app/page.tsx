"use-client";

import AudioUpload from "./components/AudioUpload";
import MoodBars from "./components/MoodBars";
import Recommendation from "./components/Recommendation";

export default function Home() {
  return (
      <div className="flex flex-col items-center p-8">
        <h1 className="text-6xl font-bold mb-8 text-white">Moodio</h1>
        
        {/* Upload Section */}
        <div className="w-full max-w-md p-6 bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center space-y-4">
          <p className="text-white text-center">Upload a song to see its mood</p>
          <AudioUpload/>
        </div>

        <MoodBars/>
        <Recommendation/>
    </div>
  );
}
