import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

let db: Database.Database | null = null;

// Kept in sync with schema.sql (the documented reference copy) by hand --
// inlined here because Next.js's server bundle doesn't reliably ship
// non-JS assets referenced via __dirname at runtime.
const SCHEMA = `
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
`;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "agentops.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  return db;
}

export function resetDbForTests(): void {
  db = null;
}
