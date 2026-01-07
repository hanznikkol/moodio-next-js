"use client";

import SpotifyButton from "@/app/main_components/Buttons/SpotifyButton";
import { useRouter } from "next/navigation";

export default function SharePageClientActions() {
  const router = useRouter();

  return (
    <SpotifyButton
      label="Try it on your own"
      onClick={() => router.push("/")}
    />
  );
}
