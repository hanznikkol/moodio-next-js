import SharedMoodResult from "@/app/main_components/Result/SharedMoodResult";
import SharePageClientActions from "./components/SharePageClientActions";
import HeroHeader from "@/app/main_components/HeroHeader";
import { getAnalysis } from "@/lib/share/ShareHelper";

interface SharedMoodPageProps {
  params: { id: string };
}

export default async function ShareMoodPage({ params }: SharedMoodPageProps) {
  const id = params.id;

  const { analysis, error } = await getAnalysis(id);

  if (!analysis) {
    return <p className="text-center mt-20">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center p-8 w-full gap-6 min-h-screen">  

      <HeroHeader
        selectedTrackID={analysis.spotifyTrackId ?? null}         
        spotifyToken={null}           
        loading={false}
        trackName={analysis.trackName}
        trackArtist={analysis.trackArtist}
        analysis={analysis}
      />

      <SharedMoodResult analysis={analysis} />

      <SharePageClientActions/>
    </div>
  );
}
