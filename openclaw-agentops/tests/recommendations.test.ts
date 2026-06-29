import { describe, expect, it } from "vitest";
import { recommendFor, rewritePrompt } from "@/lib/recommendations";
import { FAILURE_CLASSES } from "@/lib/types";

describe("recommendFor", () => {
  it("returns a non-empty recommendation for every failure class", () => {
    for (const failureClass of FAILURE_CLASSES) {
      expect(recommendFor(failureClass).length).toBeGreaterThan(0);
    }
  });
});

describe("rewritePrompt", () => {
  it("expands a vague prompt with structure for bad_prompt", () => {
    const result = rewritePrompt("fix it", "bad_prompt");
    expect(result).toContain("Goal:");
    expect(result).toContain("Expected output:");
  });

  it("appends context scaffolding for missing_context", () => {
    const result = rewritePrompt("Write the report", "missing_context");
    expect(result).toContain("Write the report");
    expect(result).toContain("Context:");
  });

  it("returns the original prompt unchanged for none", () => {
    expect(rewritePrompt("Already a good prompt", "none")).toBe("Already a good prompt");
  });
});
