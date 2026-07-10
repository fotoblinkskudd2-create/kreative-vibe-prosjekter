"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { FYLKE_NAVN } from "@/lib/fylkedata";

export default function FylkeSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (fylke: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-pink-500/20 bg-zinc-900/60 p-6 backdrop-blur">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-pink-400">
        <MapPin className="h-5 w-5" /> Velg fylke
      </h2>
      <div className="grid gap-3">
        {FYLKE_NAVN.map((fylke) => (
          <motion.button
            key={fylke}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(fylke)}
            className={`rounded-2xl p-4 text-left font-medium transition-all ${
              selected === fylke
                ? "bg-pink-600 text-white shadow-lg shadow-pink-500/50"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {fylke}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
