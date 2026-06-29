CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  agent TEXT NOT NULL,
  task TEXT NOT NULL,
  prompt TEXT NOT NULL,
  startedAt TEXT NOT NULL,
  finishedAt TEXT NOT NULL,
  durationMs INTEGER NOT NULL,
  costUsd REAL NOT NULL,
  tokensIn INTEGER NOT NULL,
  tokensOut INTEGER NOT NULL,
  toolCalls INTEGER NOT NULL,
  toolErrors INTEGER NOT NULL,
  success INTEGER NOT NULL,
  errorMessage TEXT,
  output TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_runs_startedAt ON runs(startedAt);
