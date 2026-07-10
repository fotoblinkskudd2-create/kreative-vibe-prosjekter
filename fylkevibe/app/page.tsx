"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import FylkeSelector from "@/components/FylkeSelector";
import ResearchPanel, {
  type ResearchResult,
} from "@/components/ResearchPanel";
import GonzoMode from "@/components/GonzoMode";
import VideoEmbed from "@/components/VideoEmbed";
import { DEFAULT_FYLKE } from "@/lib/fylkedata";

export default function Home() {
  const [selectedFylke, setSelectedFylke] = useState(DEFAULT_FYLKE);
  const [inputQuery, setInputQuery] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fylke: selectedFylke, query: inputQuery }),
      });
      setResult((await res.json()) as ResearchResult);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="neon-text text-6xl font-black tracking-tight text-pink-500 md:text-8xl">
          FYLKEVIBE
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          Thirsting fullstack • hent fra inputs • gonzo research • massive vibe
        </p>
      </motion.header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
        {/* Sidebar – fylkevelger */}
        <aside>
          <FylkeSelector selected={selectedFylke} onSelect={setSelectedFylke} />
        </aside>

        {/* Main input + resultater */}
        <section className="space-y-8">
          <form
            className="flex flex-col gap-4 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void handleHent();
            }}
          >
            <input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Skriv hva du vil researche… (f.eks. 'patenter i bergen 2025')"
              className="flex-1 rounded-2xl border border-pink-500/30 bg-zinc-900 px-6 py-5 text-lg placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-pink-500/40 transition-colors hover:bg-pink-500 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              HENT
            </motion.button>
          </form>

          <ResearchPanel result={result} loading={loading} />
          <VideoEmbed fylke={selectedFylke} />
        </section>

        {/* Gonzo sidepanel */}
        <aside>
          <GonzoMode fylke={selectedFylke} />
        </aside>
      </div>
    </main>
  );
}
