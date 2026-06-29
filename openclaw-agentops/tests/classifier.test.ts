import { describe, expect, it } from "vitest";
import { classifyRun } from "@/lib/classifier";
import { baseRun } from "./fixtures";

describe("classifyRun", () => {
  it("classifies a successful run with no signals as none", () => {
    expect(classifyRun(baseRun())).toBe("none");
  });

  it("classifies missing context errors", () => {
    const run = baseRun({
      success: false,
      errorMessage: "Agent reported missing context: no spec was provided",
    });
    expect(classifyRun(run)).toBe("missing_context");
  });

  it("classifies hallucinated output", () => {
    const run = baseRun({
      success: false,
      errorMessage: "Output flagged: hallucinated a fact not present in source",
    });
    expect(classifyRun(run)).toBe("hallucination");
  });

  it("classifies tool errors", () => {
    const run = baseRun({ success: false, toolErrors: 2, errorMessage: "Tool call failed" });
    expect(classifyRun(run)).toBe("tool_error");
  });

  it("classifies long-running runs as timeout", () => {
    const run = baseRun({ success: false, durationMs: 130_000 });
    expect(classifyRun(run)).toBe("timeout");
  });

  it("classifies expensive runs as cost_spike", () => {
    const run = baseRun({ costUsd: 1.5 });
    expect(classifyRun(run)).toBe("cost_spike");
  });

  it("classifies short ambiguous failing prompts as bad_prompt", () => {
    const run = baseRun({ success: false, prompt: "fix it", errorMessage: null });
    expect(classifyRun(run)).toBe("bad_prompt");
  });

  it("falls back to tool_error for unexplained failures", () => {
    const run = baseRun({
      success: false,
      prompt: "A reasonably detailed prompt with no specific failure signal attached.",
    });
    expect(classifyRun(run)).toBe("tool_error");
  });

  it("prioritizes message-based signals over tool error counts", () => {
    const run = baseRun({
      success: false,
      toolErrors: 1,
      errorMessage: "Output flagged: hallucinated a fact",
    });
    expect(classifyRun(run)).toBe("hallucination");
  });
});
