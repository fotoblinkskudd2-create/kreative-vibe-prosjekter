import { NextResponse } from "next/server";
import { getFylkeData, FYLKER } from "@/lib/data";

// POST /api/research
// Body: { fylke: string, query: string }
//
// I dag: returnerer strukturert mock-data fra lib/data.ts.
// Senere: bytt ut mock-oppslaget med ekte kilder, f.eks.:
//   - SSB API (https://data.ssb.no/api/v0/no/table/11418) for lønn
//   - Patentstyrets søk for patentsøknader
//   - Claude API / OpenClaw-agent for video-sammendrag og gonzo-tekst
export async function POST(req: Request) {
  let body: { fylke?: string; query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Ugyldig JSON-body. Send { fylke, query }." },
      { status: 400 }
    );
  }

  const fylke = typeof body.fylke === "string" ? body.fylke : "Vestland";
  const query = typeof body.query === "string" ? body.query.trim() : "";

  const data = getFylkeData(fylke);

  return NextResponse.json({
    message: `Gonzo research for ${data.fylke}${query ? `: "${query}"` : ""} – MASSIVE VIBE DELIVERED`,
    fylke: data.fylke,
    query,
    oppfinnelser: data.oppfinnelser,
    lonn: data.lonn,
    patenter: data.patenter,
    gonzo: data.gonzo,
    videoTittel: data.videoTittel,
    kilder: ["mock: SSB-stil lønnsdata", "mock: Patentstyret-stil patenttall"],
  });
}

// GET /api/research – liste over støttede fylker
export async function GET() {
  return NextResponse.json({ fylker: FYLKER });
}
