"use client";

import { MapPin } from "lucide-react";
import { FYLKER } from "@/lib/data";

export default function FylkeSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (f: string) => void;
}) {
  return (
    <div className="neon-border rounded-3xl border border-pink-500/20 bg-zinc-900/60 p-6 backdrop-blur">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-pink-400">
        <MapPin className="h-5 w-5" /> Velg fylke
      </h2>
      <div className="grid gap-2">
        {FYLKER.map((f) => (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className={`rounded-2xl p-3 text-left font-medium transition-all ${
              selected === f
                ? "bg-pink-600 text-white shadow-lg shadow-pink-500/50"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
