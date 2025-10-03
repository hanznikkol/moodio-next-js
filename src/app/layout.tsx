import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EdgeGlow from "./components/Pulse/EdgeGlow";

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
        <div className="relative flex flex-col items-center justify-center min-h-screen overflow-y-auto">
          <EdgeGlow/>
        
          {/* Main Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center mt-20">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
