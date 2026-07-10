"use client";

import { Lightbulb, DollarSign, FileBadge } from "lucide-react";
import { getFylkeData } from "@/lib/data";

export interface ResearchResult {
  message: string;
  fylke: string;
  query: string;
  oppfinnelser: string[];
  lonn: string;
  patenter: string;
  gonzo: string;
  videoTittel: string;
  kilder: string[];
}

export default function ResearchPanel({
  fylke,
  result,
}: {
  fylke: string;
  result: ResearchResult | null;
}) {
  // Vis lokal mock-data umiddelbart; API-resultat overstyrer når det kommer.
  const data = result?.fylke === fylke ? result : getFylkeData(fylke);

  return (
    <div className="neon-border rounded-3xl border border-pink-500/20 bg-zinc-900/60 p-8 backdrop-blur">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-pink-400">
        <Lightbulb className="h-6 w-6" /> Research {fylke}
      </h2>

      {result && result.fylke === fylke && (
        <p className="mb-6 rounded-2xl bg-pink-950/40 px-4 py-3 text-sm text-pink-300">
          {result.message}
        </p>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Oppfinnelser
          </h3>
          <ul className="space-y-2">
            {data.oppfinnelser.map((i) => (
              <li
                key={i}
                className="rounded-xl bg-zinc-800/60 px-4 py-3 text-zinc-200"
              >
                {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-800/60 p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
              <DollarSign className="h-4 w-4" /> Gjennomsnittslønn
            </h3>
            <p className="text-lg font-semibold text-emerald-400">{data.lonn}</p>
          </div>
          <div className="rounded-2xl bg-zinc-800/60 p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
              <FileBadge className="h-4 w-4" /> Patenter
            </h3>
            <p className="text-lg font-semibold text-cyan-400">{data.patenter}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          Data hentet fra dine inputs + SSB/Patentstyret-mock (bytt til ekte API i{" "}
          <code>app/api/research/route.ts</code>)
        </p>
      </div>
    </div>
  );
}
