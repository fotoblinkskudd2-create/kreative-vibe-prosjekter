import Link from "next/link";
import type { ScoredRun } from "@/lib/types";
import { FailureBadge } from "./FailureBadge";
import { ScoreBadge } from "./ScoreBadge";

export function RunsTable({ runs }: { runs: ScoredRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="card p-6 text-center text-slate-400">
        No runs recorded yet. Seed demo data or import a log file to get started.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3">Started</th>
            <th className="px-4 py-3">Agent</th>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Failure class</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Cost</th>
            <th className="px-4 py-3">Duration</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
              <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                {new Date(run.startedAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{run.agent}</td>
              <td className="px-4 py-3">
                <Link href={`/runs/${run.id}`} className="hover:underline">
                  {run.task}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{run.success ? "success" : "failed"}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <FailureBadge failureClass={run.failureClass} />
              </td>
              <td className="px-4 py-3">
                <ScoreBadge score={run.score} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">${run.costUsd.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{Math.round(run.durationMs / 1000)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
