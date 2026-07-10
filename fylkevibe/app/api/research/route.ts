import { FYLKER, DEFAULT_FYLKE } from "@/lib/fylkedata";

// POST /api/research  { fylke: string, query: string }
//
// Her kobler du på ekte kilder når du er klar:
//  - SSB API:          https://data.ssb.no/api/v0/no/table/
//  - Patentstyret:     https://search.patentstyret.no/
//  - Claude API:       https://docs.claude.com/ (video-sammendrag / agent-stuff)
export async function POST(req: Request) {
  const { fylke, query } = (await req.json().catch(() => ({}))) as {
    fylke?: string;
    query?: string;
  };

  const valgtFylke = fylke && FYLKER[fylke] ? fylke : DEFAULT_FYLKE;
  const data = FYLKER[valgtFylke];

  return Response.json({
    fylke: valgtFylke,
    query: query ?? "",
    ...data,
    message: `Gonzo research for ${valgtFylke}: "${query || "alt"}" – MASSIVE VIBE DELIVERED`,
    kilde: "mock (SSB/Patentstyret-stil) – bytt til ekte API her",
  });
}
