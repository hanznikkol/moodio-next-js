import { JSX } from "react";

export default function Recommendation(): JSX.Element {
    return(
        <>
            {/* Recommendation */}
            <div className="w-full max-w-md mt-8 flex flex-col items-center space-y-2">
            <p className="text-white/80 text-sm">Recommended songs based on your mood:</p>
            <div className="w-full flex flex-col space-y-2">
                <div className="p-4 bg-white/10 rounded shadow text-white">Song 1 - Mood: Chill</div>
                <div className="p-4 bg-white/10 rounded shadow text-white">Song 2 - Mood: Energetic</div>
                <div className="p-4 bg-white/10 rounded shadow text-white">Song 3 - Mood: Happy</div>
            </div>
            </div>
        </>
    )
}