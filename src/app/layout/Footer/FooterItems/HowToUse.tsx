"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { BarChart3, History, Info, Link, ScanLine, Share2, Sparkles } from "lucide-react";

function HowToUse() {
  return (
    <Drawer>
        <DrawerTrigger asChild>
            <button className=" hover:cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/20 bg-black/5 text-black dark:text-white hover:bg-white/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition text-xs sm:text-sm">
                <Info className="w-4 h-4" />
                <span>How to use</span>
            </button>
        </DrawerTrigger>

      <DrawerContent className="px-8 pb-8">
        <DrawerHeader>
            <DrawerTitle className="text-lg font-bold inline-flex items-center gap-2 dark:text-yellow-400 text-cyan-500 animate-[bounce_1s_infinite]">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <p className="dark:text-white text-black font-bold">How to Use This App</p>
                <Sparkles className="w-5 h-5 animate-pulse" />
            </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 space-y-6 text-sm">

          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <Link className="w-5 h-5 mt-[2px] dark:text-yellow-400 text-cyan-500" />
            <div>
              <p className="font-medium text-base">1. Connect Spotify</p>
              <p className="text-muted-foreground text-sm">
                Tap the <span className="font-medium">“Connect with Spotify”</span> button to link your account.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <ScanLine className="w-5 h-5 mt-[2px] dark:text-yellow-400 text-cyan-500" />
            <div>
              <p className="font-medium text-base">2. Play a Song</p>
              <p className="text-muted-foreground text-sm">
                Open Spotify and play any track. Gemini AI will detect it automatically.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 mt-[2px] dark:text-yellow-400 text-cyan-500" />
            <div>
              <p className="font-medium text-base">3. Wait for Analysis</p>
              <p className="text-muted-foreground text-sm">
                Gemini AI analyzes the song’s mood, energy, and features to create your mood profile.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 mt-[2px] dark:text-yellow-400 text-cyan-500" />
            <div>
              <p className="font-medium text-base">4. View Mood Insights</p>
              <p className="text-muted-foreground text-sm">
                Check your mood, color palette, and recommended tracks that fit your current vibe.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-3">
            <History className="w-5 h-5 mt-[2px] dark:text-yellow-400 text-cyan-500" />
            <div>
              <p className="font-medium text-base">5. Check History & Favorites</p>
              <p className="text-muted-foreground text-sm">
                Review your past mood analyses, track your listening patterns, and save your favorite songs.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 mt-[2px] dark:text-yellow-400 text-cyan-500"/>
            <div>
              <p className="font-medium text-base">6. Share with Friends</p>
              <p className="text-muted-foreground text-sm">
                Invite friends to try Gemini AI and discover their own mood insights.
              </p>
            </div>
          </div>

        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default HowToUse;
