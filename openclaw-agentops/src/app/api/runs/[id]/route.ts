import { NextRequest, NextResponse } from "next/server";
import { getScoredRunById } from "@/lib/repository";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const run = getScoredRunById(params.id);

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json({ run });
}
