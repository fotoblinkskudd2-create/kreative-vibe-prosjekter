import type { AgentRunInput } from "./types";

const REQUIRED_STRING_FIELDS = ["agent", "task", "prompt", "startedAt", "finishedAt"] as const;
const REQUIRED_NUMBER_FIELDS = [
  "durationMs",
  "costUsd",
  "tokensIn",
  "tokensOut",
  "toolCalls",
  "toolErrors",
] as const;

export function parseAgentRunInput(raw: unknown): AgentRunInput {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Run entry must be an object");
  }

  const obj = raw as Record<string, unknown>;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof obj[field] !== "string" || obj[field] === "") {
      throw new Error(`Field "${field}" must be a non-empty string`);
    }
  }

  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (typeof obj[field] !== "number" || Number.isNaN(obj[field] as number)) {
      throw new Error(`Field "${field}" must be a number`);
    }
  }

  if (typeof obj.success !== "boolean") {
    throw new Error('Field "success" must be a boolean');
  }

  if (Number.isNaN(new Date(obj.startedAt as string).getTime())) {
    throw new Error('Field "startedAt" must be a valid ISO date string');
  }
  if (Number.isNaN(new Date(obj.finishedAt as string).getTime())) {
    throw new Error('Field "finishedAt" must be a valid ISO date string');
  }

  return {
    id: typeof obj.id === "string" ? obj.id : undefined,
    agent: obj.agent as string,
    task: obj.task as string,
    prompt: obj.prompt as string,
    startedAt: obj.startedAt as string,
    finishedAt: obj.finishedAt as string,
    durationMs: obj.durationMs as number,
    costUsd: obj.costUsd as number,
    tokensIn: obj.tokensIn as number,
    tokensOut: obj.tokensOut as number,
    toolCalls: obj.toolCalls as number,
    toolErrors: obj.toolErrors as number,
    success: obj.success as boolean,
    errorMessage: typeof obj.errorMessage === "string" ? obj.errorMessage : null,
    output: typeof obj.output === "string" ? obj.output : null,
  };
}
