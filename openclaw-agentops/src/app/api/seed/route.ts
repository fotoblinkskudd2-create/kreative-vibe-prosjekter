import { NextResponse } from "next/server";
import { clearRuns, insertRuns } from "@/lib/repository";
import { generateDemoRuns } from "@/lib/seed";

export async function POST() {
  clearRuns();
  const inserted = insertRuns(generateDemoRuns());
  return NextResponse.json({ inserted: inserted.length });
}
