import Link from "next/link";
import { notFound } from "next/navigation";
import { getScoredRunById } from "@/lib/repository";
import { FailureBadge } from "@/components/FailureBadge";
import { ScoreBadge } from "@/components/ScoreBadge";

export const dynamic = "force-dynamic";

export default function RunDetailPage({ params }: { params: { id: string } }) {
  const run = getScoredRunById(params.id);

  if (!run) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        &larr; Back to dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{run.task}</h1>
        <div className="flex items-center gap-2">
          <FailureBadge failureClass={run.failureClass} />
          <ScoreBadge score={run.score} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="card p-3">
          <div className="text-slate-400">Agent</div>
          <div>{run.agent}</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Status</div>
          <div>{run.success ? "success" : "failed"}</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Duration</div>
          <div>{Math.round(run.durationMs / 1000)}s</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Cost</div>
          <div>${run.costUsd.toFixed(2)}</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Tokens in / out</div>
          <div>
            {run.tokensIn} / {run.tokensOut}
          </div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Tool calls / errors</div>
          <div>
            {run.toolCalls} / {run.toolErrors}
          </div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Started</div>
          <div>{new Date(run.startedAt).toLocaleString()}</div>
        </div>
        <div className="card p-3">
          <div className="text-slate-400">Finished</div>
          <div>{new Date(run.finishedAt).toLocaleString()}</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm text-slate-400 mb-1">Prompt</div>
        <pre className="whitespace-pre-wrap text-sm font-mono">{run.prompt}</pre>
      </div>

      {run.errorMessage && (
        <div className="card p-4 border-bad/40">
          <div className="text-sm text-slate-400 mb-1">Error message</div>
          <pre className="whitespace-pre-wrap text-sm font-mono text-bad">{run.errorMessage}</pre>
        </div>
      )}

      {run.output && (
        <div className="card p-4">
          <div className="text-sm text-slate-400 mb-1">Output</div>
          <pre className="whitespace-pre-wrap text-sm font-mono">{run.output}</pre>
        </div>
      )}

      <div className="card p-4 border-indigo-500/40">
        <div className="text-sm text-slate-400 mb-1">Recommendation</div>
        <div className="text-sm">{run.recommendation}</div>
      </div>
    </div>
  );
}
