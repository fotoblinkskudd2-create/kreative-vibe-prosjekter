"use client";

import { Flame } from "lucide-react";
import { getFylkeData } from "@/lib/data";

export default function GonzoMode({
  fylke,
  tekst,
}: {
  fylke: string;
  tekst?: string;
}) {
  const gonzo = tekst ?? getFylkeData(fylke).gonzo;

  return (
    <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-zinc-900 to-orange-950/30 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-black uppercase tracking-wider text-orange-400">
        <Flame className="h-5 w-5" /> Gonzo Mode 🔥
      </h2>
      <p className="leading-relaxed text-zinc-300">{gonzo}</p>
      <p className="mt-4 text-lg font-black uppercase text-orange-500">Thirsty?</p>
    </div>
  );
}
