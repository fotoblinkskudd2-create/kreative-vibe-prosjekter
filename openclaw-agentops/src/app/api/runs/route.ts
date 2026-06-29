import { NextRequest, NextResponse } from "next/server";
import { getAllScoredRuns, insertRuns } from "@/lib/repository";
import type { AgentRunInput } from "@/lib/types";
import { parseAgentRunInput } from "@/lib/validate";

export async function GET() {
  const runs = getAllScoredRuns();
  return NextResponse.json({ runs });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const rawRuns = Array.isArray((body as { runs?: unknown })?.runs)
    ? (body as { runs: unknown[] }).runs
    : Array.isArray(body)
      ? (body as unknown[])
      : null;

  if (!rawRuns) {
    return NextResponse.json(
      { error: 'Body must be an array of runs or { "runs": [...] }' },
      { status: 400 }
    );
  }

  const parsed: AgentRunInput[] = [];
  const errors: { index: number; error: string }[] = [];

  rawRuns.forEach((raw, index) => {
    try {
      parsed.push(parseAgentRunInput(raw));
    } catch (err) {
      errors.push({ index, error: (err as Error).message });
    }
  });

  const inserted = insertRuns(parsed);

  return NextResponse.json(
    { imported: inserted.length, failed: errors.length, errors },
    { status: errors.length > 0 && inserted.length === 0 ? 400 : 200 }
  );
}
