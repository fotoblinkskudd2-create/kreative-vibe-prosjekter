"use client";

import { Play } from "lucide-react";
import { getFylkeData } from "@/lib/data";

export default function VideoEmbed({
  fylke,
  tittel,
}: {
  fylke: string;
  tittel?: string;
}) {
  const videoTittel = tittel ?? getFylkeData(fylke).videoTittel;

  return (
    <div className="neon-border rounded-3xl border border-pink-500/20 bg-zinc-900/60 p-6 backdrop-blur">
      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-950">
        <button
          aria-label="Spill av video"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 shadow-lg shadow-pink-500/50 transition-transform hover:scale-110"
        >
          <Play className="ml-1 h-7 w-7 text-white" />
        </button>
        <p className="font-semibold text-zinc-300">{videoTittel}</p>
      </div>
      <p className="mt-3 text-xs text-zinc-600">
        Klar for OpenClaw/Claude video-sammendrag – koble til agent i{" "}
        <code>app/api/research/route.ts</code>
      </p>
    </div>
  );
}
