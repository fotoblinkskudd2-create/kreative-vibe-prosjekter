import {
  HALLUCINATION_PATTERN,
  MISSING_CONTEXT_PATTERN,
  THRESHOLDS,
} from "./thresholds";
import type { AgentRunInput, FailureClass } from "./types";

// Precedence (most specific signal wins first): explicit error-message
// signals > recorded tool errors > duration > cost > prompt quality >
// generic failure fallback > success.
export function classifyRun(run: AgentRunInput): FailureClass {
  const message = run.errorMessage ?? "";

  if (MISSING_CONTEXT_PATTERN.test(message)) return "missing_context";
  if (HALLUCINATION_PATTERN.test(message)) return "hallucination";
  if (run.toolErrors > 0) return "tool_error";
  if (run.durationMs >= THRESHOLDS.TIMEOUT_MS) return "timeout";
  if (run.costUsd >= THRESHOLDS.COST_SPIKE_USD) return "cost_spike";
  if (!run.success && run.prompt.trim().length < THRESHOLDS.BAD_PROMPT_MIN_LENGTH) {
    return "bad_prompt";
  }
  if (!run.success) return "tool_error";
  return "none";
}
