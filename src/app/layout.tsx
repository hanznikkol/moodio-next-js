import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EdgeGlow from "./main_components/BackgroundPulse/EdgeGlow";
import { Toaster } from "sonner";
import Header from "./main_components/Header&Footer/Header";
import Footer from "./main_components/Header&Footer/Footer";
import { SpotifyProvider } from "@/lib/context/spotifyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moodio",
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
        <SpotifyProvider>

          <Toaster richColors position="bottom-right" className="z-[50]"/>
          <div className="relative flex flex-col items-center justify-center min-h-screen overflow-y-auto overflow-x-hidden bg-black select-none">
            <EdgeGlow/>
            {/* Header Navigation */}
            <Header/>
            {/* Main Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center my-16">
              {children}
            </div>
            {/* Footer */}
            <Footer/>
          </div>
          
        </SpotifyProvider>
      </body>
    </html>
  );
}
