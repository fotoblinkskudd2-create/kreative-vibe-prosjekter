import { getAllScoredRuns } from "@/lib/repository";
import { RunsTable } from "@/components/RunsTable";
import { SeedButton } from "@/components/SeedButton";
import { StatsCards, type DashboardStats } from "@/components/StatsCards";
import type { FailureClass, ScoredRun } from "@/lib/types";

export const dynamic = "force-dynamic";

function computeStats(runs: ScoredRun[]): DashboardStats {
  const failedRuns = runs.filter((r) => !r.success);
  const totalCostUsd = runs.reduce((sum, r) => sum + r.costUsd, 0);
  const totalTimeWastedMs = runs
    .filter((r) => r.failureClass !== "none")
    .reduce((sum, r) => sum + r.durationMs, 0);

  const counts = new Map<FailureClass, number>();
  for (const r of runs) {
    if (r.failureClass === "none") continue;
    counts.set(r.failureClass, (counts.get(r.failureClass) ?? 0) + 1);
  }
  const topFailureReason =
    Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const sortedByScore = [...runs].sort((a, b) => b.score - a.score);
  const bestRunTask = sortedByScore[0]?.task ?? null;
  const worstRunTask = sortedByScore[sortedByScore.length - 1]?.task ?? null;

  return {
    totalRuns: runs.length,
    failedRuns: failedRuns.length,
    totalCostUsd,
    totalTimeWastedMs,
    topFailureReason,
    bestRunTask,
    worstRunTask,
  };
}

export default function DashboardPage() {
  const runs = getAllScoredRuns();
  const stats = computeStats(runs);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Agent Runs</h1>
          <p className="text-sm text-slate-400">
            Where your AI agents waste time, money and context.
          </p>
        </div>
        <SeedButton />
      </div>

      <StatsCards stats={stats} />

      <RunsTable runs={runs} />
    </div>
  );
}
