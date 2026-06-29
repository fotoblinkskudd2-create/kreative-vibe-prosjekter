import { describe, expect, it } from "vitest";
import { classifyRun } from "@/lib/classifier";
import { scoreRun } from "@/lib/scoring";
import { baseRun } from "./fixtures";

describe("scoreRun", () => {
  it("scores a clean successful run at 100", () => {
    const run = baseRun();
    expect(scoreRun(run, classifyRun(run))).toBe(100);
  });

  it("scores within 0-100 bounds even for the worst run", () => {
    const run = baseRun({
      success: false,
      toolErrors: 10,
      durationMs: 999_999,
      costUsd: 50,
    });
    const score = scoreRun(run, classifyRun(run));
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("penalizes hallucination more than bad_prompt", () => {
    const hallucinated = baseRun({
      success: false,
      errorMessage: "Output flagged: hallucinated a fact",
    });
    const badPrompt = baseRun({ success: false, prompt: "fix it" });

    const hallucinatedScore = scoreRun(hallucinated, classifyRun(hallucinated));
    const badPromptScore = scoreRun(badPrompt, classifyRun(badPrompt));

    expect(hallucinatedScore).toBeLessThan(badPromptScore);
  });

  it("penalizes additional tool errors", () => {
    const oneError = baseRun({ success: false, toolErrors: 1, errorMessage: "Tool call failed" });
    const threeErrors = baseRun({
      success: false,
      toolErrors: 3,
      errorMessage: "Tool call failed",
    });

    const oneErrorScore = scoreRun(oneError, classifyRun(oneError));
    const threeErrorsScore = scoreRun(threeErrors, classifyRun(threeErrors));

    expect(threeErrorsScore).toBeLessThan(oneErrorScore);
  });
});
