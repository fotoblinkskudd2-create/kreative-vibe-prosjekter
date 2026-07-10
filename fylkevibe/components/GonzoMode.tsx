"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { FYLKER, DEFAULT_FYLKE } from "@/lib/fylkedata";

export default function GonzoMode({ fylke }: { fylke: string }) {
  const gonzo = (FYLKER[fylke] ?? FYLKER[DEFAULT_FYLKE]).gonzo;

  return (
    <motion.div
      key={fylke}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="neon-border rounded-3xl border border-pink-500/40 bg-gradient-to-b from-pink-950/40 to-zinc-900/60 p-6"
    >
      <h2 className="neon-text mb-4 flex items-center gap-2 text-xl font-black tracking-wide text-pink-400">
        <Flame className="h-6 w-6" /> GONZO MODE 🔥
      </h2>
      <p className="leading-relaxed text-zinc-200">
        {gonzo}{" "}
        <span className="font-black text-pink-400">THIRSTY?</span>
      </p>
    </motion.div>
  );
}
