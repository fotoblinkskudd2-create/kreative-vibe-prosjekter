export type FailureClass =
  | "tool_error"
  | "hallucination"
  | "timeout"
  | "bad_prompt"
  | "missing_context"
  | "cost_spike"
  | "none";

export const FAILURE_CLASSES: FailureClass[] = [
  "tool_error",
  "hallucination",
  "timeout",
  "bad_prompt",
  "missing_context",
  "cost_spike",
  "none",
];

export interface AgentRunInput {
  id?: string;
  agent: string;
  task: string;
  prompt: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  costUsd: number;
  tokensIn: number;
  tokensOut: number;
  toolCalls: number;
  toolErrors: number;
  success: boolean;
  errorMessage?: string | null;
  output?: string | null;
}

export interface AgentRun extends AgentRunInput {
  id: string;
  errorMessage: string | null;
  output: string | null;
  createdAt: string;
}

export interface ScoredRun extends AgentRun {
  score: number;
  failureClass: FailureClass;
  recommendation: string;
}
