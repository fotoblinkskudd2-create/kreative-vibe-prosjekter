import type { AgentRunInput, ScoredRun } from "@/lib/types";
import { classifyRun } from "@/lib/classifier";
import { recommendFor } from "@/lib/recommendations";
import { scoreRun } from "@/lib/scoring";

export function baseRun(overrides: Partial<AgentRunInput> = {}): AgentRunInput {
  return {
    agent: "claude-code",
    task: "Test task",
    prompt: "Implement the test feature with clear constraints and expected output.",
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: 10_000,
    costUsd: 0.05,
    tokensIn: 500,
    tokensOut: 300,
    toolCalls: 1,
    toolErrors: 0,
    success: true,
    errorMessage: null,
    output: null,
    ...overrides,
  };
}

export function toScoredFixture(input: AgentRunInput, id: string): ScoredRun {
  const failureClass = classifyRun(input);
  return {
    ...input,
    id,
    errorMessage: input.errorMessage ?? null,
    output: input.output ?? null,
    createdAt: new Date().toISOString(),
    failureClass,
    score: scoreRun(input, failureClass),
    recommendation: recommendFor(failureClass),
  };
}
