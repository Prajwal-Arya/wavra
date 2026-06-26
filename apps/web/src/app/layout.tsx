import type { Metadata } from "next";
import "./globals.css";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PlayerBar } from "@/components/layout/PlayerBar";
import { PwaRegister } from "@/components/layout/PwaRegister";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { KeyboardShortcuts } from "@/components/player/KeyboardShortcuts";
import { LyricsPanel } from "@/components/player/LyricsPanel";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { VinylTurntable } from "@/components/player/VinylTurntable";

export const metadata: Metadata = {
  title: "Wavra",
  description: "Upload, stream, and organize music.",
  manifest: "/manifest.json",
  themeColor: "#7c3aed"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        Layout structure:
        - Sidebar: position:fixed, does not affect flow
        - Content wrapper: normal block, starts at top-0, padded left on md
        - PlayerBar: position:fixed bottom-0, does not affect flow
      */}
      <body style={{ margin: 0, padding: 0 }}>
        <AmbientBackground />
        <PwaRegister />
        <KeyboardShortcuts />
        <Sidebar />

        {/* This wrapper IS the page — it hugs the top and is offset from the sidebar */}
        <div className="md:ml-[72px]">
          <TopBar />
          <main style={{ paddingBottom: "5rem" }}>{children}</main>
        </div>

        <LyricsPanel />
        <VinylTurntable />
        <MiniPlayer />
        <PlayerBar />
      </body>
    </html>
  );
}
