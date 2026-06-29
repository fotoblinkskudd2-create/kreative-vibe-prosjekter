import { NextRequest, NextResponse } from "next/server";
import { getAllScoredRuns } from "@/lib/repository";
import { generateReport, toMarkdown } from "@/lib/report";

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? "7") || 7;
  const format = request.nextUrl.searchParams.get("format") ?? "json";

  const report = generateReport(getAllScoredRuns(), days);

  if (format === "md" || format === "markdown") {
    return new NextResponse(toMarkdown(report), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  return NextResponse.json({ report });
}
