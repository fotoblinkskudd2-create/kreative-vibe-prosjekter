"use client";

import { motion } from "framer-motion";
import { Lightbulb, DollarSign, FileBadge, Loader2 } from "lucide-react";
import type { FylkeData } from "@/lib/fylkedata";

export type ResearchResult = FylkeData & {
  fylke: string;
  query: string;
  message: string;
  kilde: string;
};

export default function ResearchPanel({
  result,
  loading,
}: {
  result: ResearchResult | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-cyan-400/20 bg-zinc-900/60 p-12 text-cyan-300">
        <Loader2 className="h-6 w-6 animate-spin" />
        Thirsting for data …
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-3xl border border-zinc-700/50 bg-zinc-900/40 p-12 text-center text-zinc-500">
        Velg fylke, skriv en query og trykk{" "}
        <span className="font-semibold text-pink-400">HENT</span> for å starte
        gonzo-researchen. 🔥
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-3xl border border-cyan-400/20 bg-zinc-900/60 p-8 backdrop-blur"
    >
      <h2 className="neon-cyan-text text-2xl font-bold text-cyan-300">
        Research: {result.fylke}
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-zinc-800/70 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-yellow-300">
            <Lightbulb className="h-5 w-5" /> OPPFINNELSER
          </h3>
          <ul className="space-y-2 text-zinc-200">
            {result.oppfinnelser.map((oppfinnelse) => (
              <li key={oppfinnelse} className="flex gap-2">
                <span className="text-pink-400">▸</span>
                {oppfinnelse}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-zinc-800/70 p-6">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-green-300">
              <DollarSign className="h-5 w-5" /> GJENNOMSNITTLØNN
            </h3>
            <p className="text-xl font-bold">{result.lonn}</p>
          </div>
          <div className="rounded-2xl bg-zinc-800/70 p-6">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-purple-300">
              <FileBadge className="h-5 w-5" /> PATENTER
            </h3>
            <p className="text-xl font-bold">{result.patents}</p>
          </div>
        </div>
      </div>

      {result.query && (
        <p className="text-sm text-zinc-400">
          Query: <span className="text-zinc-200">“{result.query}”</span>
        </p>
      )}
      <p className="text-xs text-zinc-500">{result.kilde}</p>
    </motion.div>
  );
}
