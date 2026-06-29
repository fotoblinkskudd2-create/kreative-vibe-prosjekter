import { recommendFor, rewritePrompt } from "./recommendations";
import type { FailureClass, ScoredRun } from "./types";

export interface FailureBreakdownEntry {
  failureClass: FailureClass;
  count: number;
}

export interface PromptRewriteExample {
  runId: string;
  task: string;
  before: string;
  after: string;
}

export interface WeeklyReport {
  generatedAt: string;
  windowDays: number;
  runsAnalyzed: number;
  failures: number;
  estimatedCostWasteUsd: number;
  estimatedTimeWastedMs: number;
  topFailureClass: FailureClass | null;
  biggestProblems: FailureBreakdownEntry[];
  fixes: { failureClass: FailureClass; recommendation: string }[];
  promptRewrite: PromptRewriteExample | null;
  nextBuildStep: string;
}

const NEXT_STEP_BY_CLASS: Record<FailureClass, string> = {
  tool_error:
    "Wire the failure classifier into an alert (Slack/webhook) that fires whenever tool_error runs spike above baseline.",
  hallucination:
    "Add an automated fact-check pass that re-verifies any claim flagged as hallucination before it reaches a human.",
  timeout:
    "Introduce per-step checkpoints so long-running tasks can resume instead of re-running from scratch after a timeout.",
  bad_prompt:
    "Build a pre-flight prompt linter that rejects prompts under the minimum length/specificity bar before they run.",
  missing_context:
    "Auto-attach the project's memory/context files to every prompt template instead of relying on manual inclusion.",
  cost_spike:
    "Add a hard per-run token/cost budget that aborts and reports instead of running to completion over budget.",
  none: "Promote this week's cleanest runs into a prompt-pattern library other agents can reuse.",
};

function filterByWindow(runs: ScoredRun[], days: number): ScoredRun[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return runs.filter((r) => new Date(r.startedAt).getTime() >= cutoff);
}

export function generateReport(allRuns: ScoredRun[], days = 7): WeeklyReport {
  const runs = filterByWindow(allRuns, days);
  const failedRuns = runs.filter((r) => !r.success);

  const wastedRuns = runs.filter((r) => r.failureClass !== "none");
  const estimatedCostWasteUsd = wastedRuns.reduce((sum, r) => sum + r.costUsd, 0);
  const estimatedTimeWastedMs = wastedRuns.reduce((sum, r) => sum + r.durationMs, 0);

  const counts = new Map<FailureClass, number>();
  for (const r of runs) {
    if (r.failureClass === "none") continue;
    counts.set(r.failureClass, (counts.get(r.failureClass) ?? 0) + 1);
  }

  const biggestProblems: FailureBreakdownEntry[] = Array.from(counts.entries())
    .map(([failureClass, count]) => ({ failureClass, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const topFailureClass = biggestProblems[0]?.failureClass ?? null;

  const fixes = biggestProblems.map((p) => ({
    failureClass: p.failureClass,
    recommendation: recommendFor(p.failureClass),
  }));

  const worstRun = [...wastedRuns].sort((a, b) => a.score - b.score)[0] ?? null;
  const promptRewrite: PromptRewriteExample | null = worstRun
    ? {
        runId: worstRun.id,
        task: worstRun.task,
        before: worstRun.prompt,
        after: rewritePrompt(worstRun.prompt, worstRun.failureClass),
      }
    : null;

  const nextBuildStep = topFailureClass
    ? NEXT_STEP_BY_CLASS[topFailureClass]
    : NEXT_STEP_BY_CLASS.none;

  return {
    generatedAt: new Date().toISOString(),
    windowDays: days,
    runsAnalyzed: runs.length,
    failures: failedRuns.length,
    estimatedCostWasteUsd: Math.round(estimatedCostWasteUsd * 100) / 100,
    estimatedTimeWastedMs,
    topFailureClass,
    biggestProblems,
    fixes,
    promptRewrite,
    nextBuildStep,
  };
}

function formatMs(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
}

export function toMarkdown(report: WeeklyReport): string {
  const lines: string[] = [];

  lines.push("# Weekly AgentOps Report");
  lines.push("");
  lines.push("## Summary");
  lines.push(`Runs analyzed: ${report.runsAnalyzed}`);
  lines.push(`Failures: ${report.failures}`);
  lines.push(`Estimated cost waste: $${report.estimatedCostWasteUsd.toFixed(2)}`);
  lines.push(`Estimated time wasted: ${formatMs(report.estimatedTimeWastedMs)}`);
  lines.push(`Top failure class: ${report.topFailureClass ?? "none"}`);
  lines.push("");

  lines.push("## Biggest Problems");
  if (report.biggestProblems.length === 0) {
    lines.push("1. No failures recorded in this window.");
  } else {
    report.biggestProblems.forEach((p, i) => {
      lines.push(`${i + 1}. ${p.failureClass} (${p.count} run${p.count === 1 ? "" : "s"})`);
    });
  }
  lines.push("");

  lines.push("## Fixes");
  if (report.fixes.length === 0) {
    lines.push("1. No action needed this week.");
  } else {
    report.fixes.forEach((f, i) => {
      lines.push(`${i + 1}. [${f.failureClass}] ${f.recommendation}`);
    });
  }
  lines.push("");

  lines.push("## Prompt Rewrite");
  if (report.promptRewrite) {
    lines.push(`Before:\n${report.promptRewrite.before}`);
    lines.push("");
    lines.push(`After:\n${report.promptRewrite.after}`);
  } else {
    lines.push("Before:\n(no failing runs to rewrite this week)");
    lines.push("");
    lines.push("After:\n(n/a)");
  }
  lines.push("");

  lines.push("## Next Build Step");
  lines.push(report.nextBuildStep);
  lines.push("");

  return lines.join("\n");
}
