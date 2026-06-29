import { getAllScoredRuns } from "@/lib/repository";
import { generateReport } from "@/lib/report";

export const dynamic = "force-dynamic";

export default function ReportPage() {
  const report = generateReport(getAllScoredRuns(), 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Weekly AgentOps Report</h1>
          <p className="text-sm text-slate-400">
            Last 7 days &middot; generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
        <a
          href="/api/report?format=md"
          download="weekly-agentops-report.md"
          className="rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-medium"
        >
          Download .md
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="card p-3">
          <div className="text-slate-400">Runs analyzed</div>
          <div className="text-2xl font-semibold">{report.runsAnalyzed}</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Failures</div>
          <div className="text-2xl font-semibold">{report.failures}</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Estimated cost waste</div>
          <div className="text-2xl font-semibold">${report.estimatedCostWasteUsd.toFixed(2)}</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Top failure class</div>
          <div className="text-2xl font-semibold">{report.topFailureClass ?? "none"}</div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Biggest Problems</h2>
        {report.biggestProblems.length === 0 ? (
          <p className="text-sm text-slate-400">No failures recorded in this window.</p>
        ) : (
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {report.biggestProblems.map((p) => (
              <li key={p.failureClass}>
                {p.failureClass} &mdash; {p.count} run{p.count === 1 ? "" : "s"}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Fixes</h2>
        {report.fixes.length === 0 ? (
          <p className="text-sm text-slate-400">No action needed this week.</p>
        ) : (
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {report.fixes.map((f) => (
              <li key={f.failureClass}>
                <span className="text-slate-400">[{f.failureClass}]</span> {f.recommendation}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Prompt Rewrite</h2>
        {report.promptRewrite ? (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Before</div>
              <pre className="whitespace-pre-wrap font-mono">{report.promptRewrite.before}</pre>
            </div>
            <div>
              <div className="text-slate-400 mb-1">After</div>
              <pre className="whitespace-pre-wrap font-mono">{report.promptRewrite.after}</pre>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No failing runs to rewrite this week.</p>
        )}
      </div>

      <div className="card p-4 border-indigo-500/40">
        <h2 className="font-semibold mb-2">Next Build Step</h2>
        <p className="text-sm">{report.nextBuildStep}</p>
      </div>
    </div>
  );
}
