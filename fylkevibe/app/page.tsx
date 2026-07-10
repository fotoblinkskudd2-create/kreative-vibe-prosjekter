"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import FylkeSelector from "@/components/FylkeSelector";
import ResearchPanel from "@/components/ResearchPanel";
import GonzoMode from "@/components/GonzoMode";
import VideoEmbed from "@/components/VideoEmbed";
import type { ResearchResult } from "@/components/ResearchPanel";

export default function Home() {
  const [selectedFylke, setSelectedFylke] = useState("Vestland");
  const [inputQuery, setInputQuery] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fylke: selectedFylke, query: inputQuery }),
      });
      if (!res.ok) throw new Error(`API svarte med ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-grid">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="neon-text text-6xl font-black tracking-tighter text-pink-500 md:text-8xl">
            FYLKEVIBE
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Thirsting fullstack • hent fra inputs • gonzo research • massive vibe
          </p>
        </motion.header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
          {/* Sidebar – fylkevelger */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FylkeSelector selected={selectedFylke} onSelect={setSelectedFylke} />
          </motion.aside>

          {/* Main input + results */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex gap-3">
              <input
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHent()}
                placeholder="Skriv hva du vil researche... (f.eks. 'patenter i bergen 2025')"
                className="flex-1 rounded-2xl border border-pink-500/30 bg-zinc-900 px-6 py-5 text-lg placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
              />
              <button
                onClick={handleHent}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-pink-600 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-pink-500/40 transition-all hover:bg-pink-500 hover:shadow-pink-500/60 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                HENT
              </button>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-4 text-red-300">
                {error}
              </p>
            )}

            <ResearchPanel fylke={selectedFylke} result={result} />
            <VideoEmbed
              fylke={selectedFylke}
              tittel={result?.videoTittel}
            />
          </motion.section>

          {/* Gonzo sidepanel */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GonzoMode fylke={selectedFylke} tekst={result?.gonzo} />
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
