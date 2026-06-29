import type { AgentRunInput } from "./types";

// Demo data exercises every failure class at least twice, spread across
// agents and the last 9 days so the weekly report has real signal to chew on.
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function run(
  agent: string,
  task: string,
  prompt: string,
  startHoursAgo: number,
  durationMs: number,
  opts: Partial<AgentRunInput> = {}
): AgentRunInput {
  const startedAt = hoursAgo(startHoursAgo);
  const finishedAt = new Date(
    new Date(startedAt).getTime() + durationMs
  ).toISOString();

  return {
    agent,
    task,
    prompt,
    startedAt,
    finishedAt,
    durationMs,
    costUsd: 0.05,
    tokensIn: 800,
    tokensOut: 400,
    toolCalls: 2,
    toolErrors: 0,
    success: true,
    errorMessage: null,
    output: null,
    ...opts,
  };
}

export function generateDemoRuns(): AgentRunInput[] {
  return [
    run(
      "claude-code",
      "Scaffold OpenClaw AgentOps repo",
      "Build the MVP for OpenClaw AgentOps with Next.js, SQLite and Tailwind.",
      9 * 24,
      42_000,
      { costUsd: 0.31, tokensIn: 6200, tokensOut: 3100, toolCalls: 18 }
    ),
    run(
      "codex",
      "Fix failing TypeScript build",
      "Take the OpenClaw AgentOps repository and make it actually run.",
      9 * 24 - 2,
      31_000,
      { costUsd: 0.18, tokensIn: 4100, tokensOut: 2200, toolCalls: 9 }
    ),

    // tool_error
    run(
      "codex",
      "Run database migration script",
      "Apply the new schema migration and confirm the runs table is updated.",
      8 * 24,
      18_500,
      {
        toolErrors: 2,
        toolCalls: 5,
        success: false,
        errorMessage: "Tool call failed: sqlite3 binary not found on PATH",
      }
    ),
    run(
      "openclaw",
      "Deploy landing page draft",
      "Push the landing page build to the static hosting bucket.",
      7 * 24,
      9_200,
      {
        toolErrors: 1,
        toolCalls: 3,
        success: false,
        errorMessage: "Tool call failed: upload returned 403 Forbidden",
      }
    ),

    // hallucination
    run(
      "claude-code",
      "Summarize prior art for drone ROV patent",
      "Summarize the three closest existing patents for the acoustic leak detector.",
      8 * 24 - 4,
      27_000,
      {
        success: false,
        errorMessage:
          "Output flagged: hallucinated a patent number that does not exist in the source corpus",
      }
    ),
    run(
      "codex",
      "Generate citation list for legal draft",
      "List the legal precedents supporting the complaint draft.",
      6 * 24,
      15_300,
      {
        success: false,
        errorMessage: "Output flagged: fabricated a case citation not present in source documents",
      }
    ),

    // timeout
    run(
      "openclaw",
      "Crawl municipal PDF archive",
      "Download and parse every municipal fee PDF from the last 5 years.",
      7 * 24 - 6,
      151_000,
      { success: false, errorMessage: "Run exceeded time budget and was terminated" }
    ),
    run(
      "claude-code",
      "Full repo dependency audit",
      "Audit every dependency in the monorepo for license and CVE issues.",
      5 * 24,
      138_000,
      { success: false, errorMessage: "Run exceeded time budget and was terminated" }
    ),

    // cost_spike
    run(
      "codex",
      "Refactor entire agent scoring module",
      "Refactor the scoring module and re-run the full test suite three times.",
      6 * 24 - 3,
      52_000,
      { costUsd: 1.42, tokensIn: 38_000, tokensOut: 21_000, toolCalls: 14 }
    ),
    run(
      "claude-code",
      "Regenerate full report history",
      "Regenerate every historical weekly report from raw logs.",
      4 * 24,
      61_000,
      { costUsd: 1.18, tokensIn: 29_000, tokensOut: 17_500, toolCalls: 11 }
    ),

    // missing_context
    run(
      "openclaw",
      "Draft customer email for PatentGraver",
      "Write the outreach email.",
      5 * 24 - 5,
      8_400,
      {
        success: false,
        errorMessage: "Agent reported missing context: no product spec or audience was provided",
      }
    ),
    run(
      "codex",
      "Patch leak-probability scorer",
      "Fix the bug in the scorer.",
      3 * 24,
      11_000,
      {
        success: false,
        errorMessage: "Agent reported insufficient context: target file path was not specified",
      }
    ),

    // bad_prompt
    run("claude-code", "Unclear one-off task", "fix it", 4 * 24 - 2, 6_000, {
      success: false,
      errorMessage: "Run aborted: prompt too ambiguous to act on",
    }),
    run("openclaw", "Unclear one-off task", "do the thing", 2 * 24, 5_200, {
      success: false,
      errorMessage: "Run aborted: prompt too ambiguous to act on",
    }),

    // healthy/successful runs (none)
    run(
      "claude-code",
      "Add weekly report markdown export",
      "Implement the /api/report endpoint with a markdown export option, matching the spec template exactly.",
      3 * 24 - 6,
      24_000,
      { costUsd: 0.22, tokensIn: 5_000, tokensOut: 2_600, toolCalls: 7 }
    ),
    run(
      "codex",
      "Write vitest suite for classifier",
      "Add unit tests covering every failure class branch in the classifier.",
      2 * 24 - 3,
      19_000,
      { costUsd: 0.16, tokensIn: 3_400, tokensOut: 1_900, toolCalls: 6 }
    ),
    run(
      "openclaw",
      "Score five value candidates",
      "Score the top five value candidates from this week's memory extraction using the value formula.",
      1 * 24,
      13_500,
      { costUsd: 0.09, tokensIn: 2_100, tokensOut: 1_200, toolCalls: 1 }
    ),
    run(
      "claude-code",
      "Build dashboard stats cards",
      "Implement the dashboard summary cards for total runs, failures, cost waste and time wasted.",
      18,
      29_000,
      { costUsd: 0.27, tokensIn: 5_800, tokensOut: 3_000, toolCalls: 8 }
    ),
    run(
      "codex",
      "Tighten failure classifier thresholds",
      "Tune the timeout and cost spike thresholds based on the demo dataset and document the change.",
      6,
      21_000,
      { costUsd: 0.14, tokensIn: 3_000, tokensOut: 1_700, toolCalls: 4 }
    ),
  ];
}
