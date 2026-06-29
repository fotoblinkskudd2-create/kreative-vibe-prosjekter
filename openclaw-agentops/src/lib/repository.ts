import { randomUUID } from "crypto";
import { getDb } from "./db";
import { classifyRun } from "./classifier";
import { recommendFor } from "./recommendations";
import { scoreRun } from "./scoring";
import type { AgentRun, AgentRunInput, ScoredRun } from "./types";

interface RunRow {
  id: string;
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
  success: number;
  errorMessage: string | null;
  output: string | null;
  createdAt: string;
}

function rowToRun(row: RunRow): AgentRun {
  return {
    ...row,
    success: row.success === 1,
  };
}

export function insertRun(input: AgentRunInput): AgentRun {
  const db = getDb();
  const id = input.id ?? randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO runs (
      id, agent, task, prompt, startedAt, finishedAt, durationMs, costUsd,
      tokensIn, tokensOut, toolCalls, toolErrors, success, errorMessage, output, createdAt
    ) VALUES (
      @id, @agent, @task, @prompt, @startedAt, @finishedAt, @durationMs, @costUsd,
      @tokensIn, @tokensOut, @toolCalls, @toolErrors, @success, @errorMessage, @output, @createdAt
    )
    ON CONFLICT(id) DO UPDATE SET
      agent=excluded.agent, task=excluded.task, prompt=excluded.prompt,
      startedAt=excluded.startedAt, finishedAt=excluded.finishedAt,
      durationMs=excluded.durationMs, costUsd=excluded.costUsd,
      tokensIn=excluded.tokensIn, tokensOut=excluded.tokensOut,
      toolCalls=excluded.toolCalls, toolErrors=excluded.toolErrors,
      success=excluded.success, errorMessage=excluded.errorMessage, output=excluded.output`
  ).run({
    id,
    agent: input.agent,
    task: input.task,
    prompt: input.prompt,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    durationMs: input.durationMs,
    costUsd: input.costUsd,
    tokensIn: input.tokensIn,
    tokensOut: input.tokensOut,
    toolCalls: input.toolCalls,
    toolErrors: input.toolErrors,
    success: input.success ? 1 : 0,
    errorMessage: input.errorMessage ?? null,
    output: input.output ?? null,
    createdAt,
  });

  return getRunById(id) as AgentRun;
}

export function insertRuns(inputs: AgentRunInput[]): AgentRun[] {
  return inputs.map(insertRun);
}

export function getAllRuns(): AgentRun[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM runs ORDER BY startedAt DESC`)
    .all() as RunRow[];
  return rows.map(rowToRun);
}

export function getRunById(id: string): AgentRun | undefined {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM runs WHERE id = ?`).get(id) as
    | RunRow
    | undefined;
  return row ? rowToRun(row) : undefined;
}

export function clearRuns(): void {
  const db = getDb();
  db.prepare(`DELETE FROM runs`).run();
}

export function toScoredRun(run: AgentRun): ScoredRun {
  const failureClass = classifyRun(run);
  return {
    ...run,
    failureClass,
    score: scoreRun(run, failureClass),
    recommendation: recommendFor(failureClass),
  };
}

export function getAllScoredRuns(): ScoredRun[] {
  return getAllRuns().map(toScoredRun);
}

export function getScoredRunById(id: string): ScoredRun | undefined {
  const run = getRunById(id);
  return run ? toScoredRun(run) : undefined;
}
