export type FylkeData = {
  oppfinnelser: string[];
  lonn: string;
  patents: string;
  gonzo: string;
};

// Mock-data i SSB/Patentstyret-stil. Bytt ut med ekte API-kall i
// app/api/research/route.ts når du er klar.
export const FYLKER: Record<string, FylkeData> = {
  Vestland: {
    oppfinnelser: [
      "Hydro Aluminium-prosess (2024-patenter)",
      "Havvind-teknologi Bergen",
      "AI-fiskeovervåking i oppdrettsanlegg",
      "Subsea-robotikk fra Ågotnes",
    ],
    lonn: "Gjennomsnitt 712 000 kr/år (SSB 2026)",
    patents: "3 214 nye søknader (topp 3 i Norge)",
    gonzo:
      "Vestland er ikke bare tall. Det er blod, svette og norske oppfinnere som knuser oljebaroner med havvind og AI. Lønna er fet, patentene flyr – og du sitter her og henter data som en digital Hunter S. Thompson.",
  },
  Oslo: {
    oppfinnelser: [
      "Quantum computing-startup i Forskningsparken",
      "Fintech-betalingsrails",
      "MedTech-diagnostikk med maskinlæring",
    ],
    lonn: "Gjennomsnitt 845 000 kr/år (SSB 2026)",
    patents: "4 892 nye søknader (nr. 1 i Norge)",
    gonzo:
      "Oslo: glass, stål og pitch-decks. Alle har en startup, ingen har parkeringsplass. Patentkontoret går varmt mens kaffen koster 62 kroner.",
  },
  Rogaland: {
    oppfinnelser: [
      "Boreteknologi-patenter fra Forus",
      "Karbonfangst offshore",
      "Presisjonslandbruk på Jæren",
    ],
    lonn: "Gjennomsnitt 768 000 kr/år (SSB 2026)",
    patents: "2 987 nye søknader",
    gonzo:
      "Rogaland lukter fortsatt råolje, men pengene renner nå inn i CO₂-fangst og roboter. Oljebaronene har byttet dress – ikke bankkonto.",
  },
  Trøndelag: {
    oppfinnelser: [
      "NTNU-spinoffs: sensorikk og autonomi",
      "Havbruksteknologi fra Frøya",
      "Batterimaterialer fra Orkanger",
    ],
    lonn: "Gjennomsnitt 695 000 kr/år (SSB 2026)",
    patents: "2 431 nye søknader",
    gonzo:
      "Trøndelag: der professorer og laksemilliardærer deler bord på Solsiden. Halvparten av norske patenter har en NTNU-veileder gjemt i fotnoten.",
  },
  Akershus: {
    oppfinnelser: [
      "Romteknologi fra Kjeller",
      "Energilagring og smartgrid",
      "Logistikk-automasjon på Gardermoen",
    ],
    lonn: "Gjennomsnitt 782 000 kr/år (SSB 2026)",
    patents: "3 105 nye søknader",
    gonzo:
      "Akershus er Oslos maskinrom: rakettforskere på Kjeller, roboter på Gardermoen, og pendlere som oppfinner ting i kø på E6.",
  },
};

export const FYLKE_NAVN = Object.keys(FYLKER);

export const DEFAULT_FYLKE = "Vestland";
