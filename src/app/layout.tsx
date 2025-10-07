import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EdgeGlow from "./main_components/Pulse/EdgeGlow";
import { Toaster } from "sonner";
import { FaGithub } from "react-icons/fa";
import { History } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moodio: Music Mood Analyzer",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <div className="relative flex flex-col items-center justify-center min-h-screen overflow-y-auto bg-black">
          <EdgeGlow/>

          {/* Header */}
          <header className="fixed top-0 right-0 flex items-center gap-4 p-6 z-20">
            {/* Github Repo */}
            <a className="hover:scale-110 duration-100 hover:cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/hanznikkol/moodio-next-js"
            >
              <FaGithub size={24} color="white"/>
            </a>

            <button 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 text-white rounded-lg transition-all hover:cursor-pointer duration-200 border border-white/10">
              <History className="w-5 h-5"/>
              History
            </button>
          </header>

          {/* Main Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center mt-20">
            {children}
            <Toaster richColors position="bottom-right"/>
          </div>
        </div>
      </body>
    </html>
  );
}
