import type { FailureClass } from "@/lib/types";

export interface DashboardStats {
  totalRuns: number;
  failedRuns: number;
  totalCostUsd: number;
  totalTimeWastedMs: number;
  topFailureReason: FailureClass | null;
  bestRunTask: string | null;
  worstRunTask: string | null;
}

function formatMs(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function Card({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Total runs" value={stats.totalRuns} />
      <Card label="Failed runs" value={stats.failedRuns} />
      <Card label="Cost estimate" value={`$${stats.totalCostUsd.toFixed(2)}`} />
      <Card label="Time wasted" value={formatMs(stats.totalTimeWastedMs)} />
      <Card label="Top failure reason" value={stats.topFailureReason ?? "none"} />
      <Card
        label="Best prompt"
        value={<span className="text-base font-normal">{stats.bestRunTask ?? "n/a"}</span>}
      />
      <Card
        label="Worst prompt"
        value={<span className="text-base font-normal">{stats.worstRunTask ?? "n/a"}</span>}
      />
    </div>
  );
}
