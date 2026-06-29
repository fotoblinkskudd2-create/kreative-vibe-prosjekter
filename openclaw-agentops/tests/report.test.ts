import { describe, expect, it } from "vitest";
import { generateReport, toMarkdown } from "@/lib/report";
import { baseRun, toScoredFixture } from "./fixtures";

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

describe("generateReport", () => {
  it("counts failures and identifies the top failure class within the window", () => {
    const runs = [
      toScoredFixture(baseRun({ startedAt: isoHoursAgo(10) }), "ok-1"),
      toScoredFixture(
        baseRun({
          startedAt: isoHoursAgo(20),
          success: false,
          toolErrors: 1,
          errorMessage: "Tool call failed",
        }),
        "tool-error-1"
      ),
      toScoredFixture(
        baseRun({
          startedAt: isoHoursAgo(30),
          success: false,
          toolErrors: 1,
          errorMessage: "Tool call failed",
        }),
        "tool-error-2"
      ),
      // Outside the 7 day window, should be excluded.
      toScoredFixture(
        baseRun({
          startedAt: isoHoursAgo(24 * 30),
          success: false,
          toolErrors: 1,
          errorMessage: "Tool call failed",
        }),
        "tool-error-old"
      ),
    ];

    const report = generateReport(runs, 7);

    expect(report.runsAnalyzed).toBe(3);
    expect(report.failures).toBe(2);
    expect(report.topFailureClass).toBe("tool_error");
    expect(report.biggestProblems[0]).toEqual({ failureClass: "tool_error", count: 2 });
  });

  it("picks the lowest-scoring failing run for the prompt rewrite example", () => {
    const runs = [
      toScoredFixture(baseRun({ startedAt: isoHoursAgo(1) }), "ok-1"),
      toScoredFixture(
        baseRun({ startedAt: isoHoursAgo(2), success: false, prompt: "fix it" }),
        "bad-prompt-1"
      ),
    ];

    const report = generateReport(runs, 7);

    expect(report.promptRewrite?.runId).toBe("bad-prompt-1");
    expect(report.promptRewrite?.after).toContain("Goal:");
  });

  it("handles an empty run list without throwing", () => {
    const report = generateReport([], 7);
    expect(report.runsAnalyzed).toBe(0);
    expect(report.topFailureClass).toBeNull();
    expect(report.promptRewrite).toBeNull();
  });
});

describe("toMarkdown", () => {
  it("renders every required section of the report template", () => {
    const runs = [
      toScoredFixture(
        baseRun({ startedAt: isoHoursAgo(1), success: false, prompt: "fix it" }),
        "bad-prompt-1"
      ),
    ];
    const markdown = toMarkdown(generateReport(runs, 7));

    expect(markdown).toContain("# Weekly AgentOps Report");
    expect(markdown).toContain("## Summary");
    expect(markdown).toContain("## Biggest Problems");
    expect(markdown).toContain("## Fixes");
    expect(markdown).toContain("## Prompt Rewrite");
    expect(markdown).toContain("## Next Build Step");
  });
});
