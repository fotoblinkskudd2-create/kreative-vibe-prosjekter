"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function VideoEmbed({ fylke }: { fylke: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border border-purple-500/20 bg-zinc-900/60 p-6"
    >
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-purple-950 via-zinc-900 to-pink-950">
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            whileHover={{ scale: 1.15 }}
            className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-pink-600 shadow-lg shadow-pink-500/50"
          >
            <Play className="ml-1 h-8 w-8 fill-white text-white" />
          </motion.div>
          <p className="font-semibold text-zinc-200">
            Gonzo Video: {fylke} Innovation 2026
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        Klar for OpenClaw/Claude video-sammendrag – koble på API-nøkkel i{" "}
        <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-pink-300">
          app/api/research/route.ts
        </code>
      </p>
    </motion.div>
  );
}
