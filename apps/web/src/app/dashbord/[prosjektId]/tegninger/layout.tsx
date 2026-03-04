"use client";

import { SekundaertPanel } from "@/components/layout/SekundaertPanel";
import { TegningerPanel } from "@/components/paneler/TegningerPanel";

export default function TegningerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SekundaertPanel tittel="Tegninger">
        <TegningerPanel />
      </SekundaertPanel>
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </>
  );
}
