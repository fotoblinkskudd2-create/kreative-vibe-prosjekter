import { THRESHOLDS } from "./thresholds";
import type { AgentRunInput, FailureClass } from "./types";

const FAILURE_PENALTY: Record<FailureClass, number> = {
  none: 0,
  bad_prompt: 10,
  missing_context: 15,
  cost_spike: 15,
  tool_error: 20,
  timeout: 25,
  hallucination: 30,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreRun(run: AgentRunInput, failureClass: FailureClass): number {
  let score = run.success ? 100 : 55;

  score -= FAILURE_PENALTY[failureClass];
  score -= Math.min(run.toolErrors, 5) * 5;

  if (run.durationMs >= THRESHOLDS.SLOW_MS) score -= 10;
  if (run.costUsd >= THRESHOLDS.ELEVATED_COST_USD) score -= 5;

  return clamp(Math.round(score), 0, 100);
}
