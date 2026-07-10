// FylkeVibe mock-datasett – strukturert som ekte SSB/Patentstyret-data,
// slik at det er lett å bytte ut mock med ekte API-kall senere.
// Lønnstall er inspirert av SSB tabell 11418 (gjennomsnittlig månedslønn
// omregnet til årslønn), patenttall av Patentstyrets statistikk.

export interface FylkeData {
  fylke: string;
  oppfinnelser: string[];
  lonn: string;
  patenter: string;
  gonzo: string;
  videoTittel: string;
}

export const FYLKER = [
  "Vestland",
  "Oslo",
  "Rogaland",
  "Trøndelag",
  "Akershus",
  "Nordland",
  "Møre og Romsdal",
  "Troms",
  "Innlandet",
  "Agder",
  "Vestfold",
  "Telemark",
  "Buskerud",
  "Østfold",
  "Finnmark",
] as const;

export type Fylke = (typeof FYLKER)[number];

export const FYLKE_DATA: Record<Fylke, FylkeData> = {
  Vestland: {
    fylke: "Vestland",
    oppfinnelser: [
      "Hydro Aluminium-prosess (nye patentsøknader 2024–2025)",
      "Flytende havvind-teknologi fra Bergens-miljøet",
      "AI-basert fiskeovervåking i oppdrettsanlegg",
      "Subsea-robotikk fra klyngene rundt Bergen og Ågotnes",
    ],
    lonn: "Gjennomsnitt ca. 712 000 kr/år (SSB-stil estimat 2026)",
    patenter: "3 214 nye søknader – topp 3 i Norge",
    gonzo:
      "Vestland er ikke bare tall. Det er blod, svette og regntunge oppfinnere som knuser oljebaroner med havvind og AI. Lønna er fet, patentene flyr over Puddefjorden – og du sitter her og henter data som en digital Hunter S. Thompson.",
    videoTittel: "Gonzo Video: Vestland Innovation 2026",
  },
  Oslo: {
    fylke: "Oslo",
    oppfinnelser: [
      "Quantum computing-startups i Oslo Science City",
      "Fintech-infrastruktur (betaling og ID)",
      "Helseteknologi og diagnostikk-AI fra Ullevål-miljøet",
    ],
    lonn: "Gjennomsnitt ca. 845 000 kr/år (SSB-stil estimat 2026)",
    patenter: "4 892 nye søknader – nummer 1 i Norge",
    gonzo:
      "Oslo: glass, stål og pitch decks. Alle har en startup, halvparten har en exit-drøm, og kaffen koster like mye som en patentsøknad i 1970. Men tallene lyver ikke – hovedstaden pumper ut IP som en trykkoker.",
    videoTittel: "Gonzo Video: Oslo Innovation 2026",
  },
  Rogaland: {
    fylke: "Rogaland",
    oppfinnelser: [
      "Boreteknologi og brønnintervensjon (Stavanger-miljøet)",
      "Karbonfangst og -lagring (CCS) på Nordsjø-skala",
      "Robotisert landbruk fra Jæren",
    ],
    lonn: "Gjennomsnitt ca. 768 000 kr/år (SSB-stil estimat 2026)",
    patenter: "2 941 nye søknader – energihovedstaden leverer",
    gonzo:
      "Rogaland er stedet der oljearbeidere blir grønne gründere over natten. Jæren-bønder bygger roboter, Stavanger-ingeniører pumper CO2 ned igjen der oljen kom opp. Ironien er tykkere enn råoljen.",
    videoTittel: "Gonzo Video: Rogaland Innovation 2026",
  },
  Trøndelag: {
    fylke: "Trøndelag",
    oppfinnelser: [
      "NTNU-spinouts innen sensorikk og autonomi",
      "Ubemannede fartøy og maritim autonomi (Trondheimsfjorden)",
      "Solcelleteknologi og silisium-prosesser",
    ],
    lonn: "Gjennomsnitt ca. 695 000 kr/år (SSB-stil estimat 2026)",
    patenter: "2 380 nye søknader – universitetsmaskinen ruller",
    gonzo:
      "Trøndelag: der professorer og studenter smelter sammen til én stor patentproduserende organisme. NTNU spytter ut spinouts fortere enn du rekker å si 'immaterielle rettigheter'.",
    videoTittel: "Gonzo Video: Trøndelag Innovation 2026",
  },
  Akershus: {
    fylke: "Akershus",
    oppfinnelser: [
      "Forsvarsteknologi og missilsystemer (Kjeller/Kongsberg-aksen)",
      "Energiforskning ved IFE",
      "Logistikk-automasjon rundt Gardermoen",
    ],
    lonn: "Gjennomsnitt ca. 782 000 kr/år (SSB-stil estimat 2026)",
    patenter: "2 105 nye søknader",
    gonzo:
      "Akershus er ringen rundt hovedstaden der de faktiske tingene bygges. Raketter på Kjeller, reaktorhistorie på IFE, og logistikkroboter som aldri sover. Ingen glamour – bare rå leveranse.",
    videoTittel: "Gonzo Video: Akershus Innovation 2026",
  },
  Nordland: {
    fylke: "Nordland",
    oppfinnelser: [
      "Batterifabrikk-prosesser (Mo i Rana)",
      "Havbruksteknologi for arktiske forhold",
      "Grønn hydrogen fra vannkraftoverskudd",
    ],
    lonn: "Gjennomsnitt ca. 662 000 kr/år (SSB-stil estimat 2026)",
    patenter: "980 nye søknader – industri-nord våkner",
    gonzo:
      "Nordland: midnattssol, smeltet metall og batterier store nok til å drive en by. De bygger fremtiden i industrihaller der polarsirkelen krysser hovedveien. Sørlendinger aner ikke hva som treffer dem.",
    videoTittel: "Gonzo Video: Nordland Innovation 2026",
  },
  "Møre og Romsdal": {
    fylke: "Møre og Romsdal",
    oppfinnelser: [
      "Skipsdesign og fremdriftssystemer (Ulsteinvik/Ålesund)",
      "Møbelindustri-automasjon (Sykkylven)",
      "Dypvannsfiske-teknologi",
    ],
    lonn: "Gjennomsnitt ca. 671 000 kr/år (SSB-stil estimat 2026)",
    patenter: "1 240 nye søknader – maritim klynge i verdensklasse",
    gonzo:
      "Møre og Romsdal designer skip verden aldri har sett maken til, i bygder der alle kjenner alle og halve bygda eier verft. Stillferdig verdensherredømme, én skrogseksjon om gangen.",
    videoTittel: "Gonzo Video: Møre og Romsdal Innovation 2026",
  },
  Troms: {
    fylke: "Troms",
    oppfinnelser: [
      "Romteknologi og satellitt-nedlesing (Tromsø)",
      "Marin bioprospektering fra arktiske farvann",
      "Nordlys-forskning og atmosfæresensorikk",
    ],
    lonn: "Gjennomsnitt ca. 668 000 kr/år (SSB-stil estimat 2026)",
    patenter: "640 nye søknader",
    gonzo:
      "Troms leser ned satellitter mens nordlyset flammer over hodet på dem. Arktisk biotek fra havet, romdata fra himmelen – porten til Arktis er også porten til verdensrommet.",
    videoTittel: "Gonzo Video: Troms Innovation 2026",
  },
  Innlandet: {
    fylke: "Innlandet",
    oppfinnelser: [
      "Spillteknologi og VR (Hamar-miljøet)",
      "Bioøkonomi og treforedling",
      "Cybersikkerhet (Gjøvik/NTNU)",
    ],
    lonn: "Gjennomsnitt ca. 645 000 kr/år (SSB-stil estimat 2026)",
    patenter: "720 nye søknader",
    gonzo:
      "Innlandet: skog så langt øyet ser, og midt i den sitter spillutviklere og cybersikkerhetsfolk og bygger digitale verdener. Tømmer og terabyte, side om side.",
    videoTittel: "Gonzo Video: Innlandet Innovation 2026",
  },
  Agder: {
    fylke: "Agder",
    oppfinnelser: [
      "Boredekksmaskiner og offshore-kraner (NODE-klyngen)",
      "Batterier og grønn prosessindustri",
      "Mekatronikk fra UiA-miljøet",
    ],
    lonn: "Gjennomsnitt ca. 684 000 kr/år (SSB-stil estimat 2026)",
    patenter: "1 050 nye søknader",
    gonzo:
      "Agder bygger jernmonstrene som løfter oljeplattformer – og nå batterifabrikkene som skal erstatte dem. Sørlandsidyll utenpå, hydraulisk råskap inni.",
    videoTittel: "Gonzo Video: Agder Innovation 2026",
  },
  Vestfold: {
    fylke: "Vestfold",
    oppfinnelser: [
      "Mikrosystemer og sensorer (Horten-klyngen)",
      "Elektronikk for rom og forsvar",
      "Vannrensing og miljøteknologi",
    ],
    lonn: "Gjennomsnitt ca. 676 000 kr/år (SSB-stil estimat 2026)",
    patenter: "830 nye søknader",
    gonzo:
      "Vestfold pakker nanometer-presisjon inn i badebyidyll. Horten-miljøet lager sensorer som sitter i alt fra romsonder til hjertepumper – og nesten ingen vet det.",
    videoTittel: "Gonzo Video: Vestfold Innovation 2026",
  },
  Telemark: {
    fylke: "Telemark",
    oppfinnelser: [
      "Prosessindustri og elektrokjemi (Herøya)",
      "Karbonfangst-pilotering",
      "Vannkraft-optimalisering",
    ],
    lonn: "Gjennomsnitt ca. 658 000 kr/år (SSB-stil estimat 2026)",
    patenter: "560 nye søknader",
    gonzo:
      "Telemark: der norsk industrieventyr ble født, og der det nekter å dø. Herøya har omskolert seg fra kunstgjødsel til karbonfangst uten å miste ett eneste skift.",
    videoTittel: "Gonzo Video: Telemark Innovation 2026",
  },
  Buskerud: {
    fylke: "Buskerud",
    oppfinnelser: [
      "Systems engineering og subsea (Kongsberg)",
      "Papir- og fiberteknologi (Drammensvassdraget)",
      "Autonome transportsystemer",
    ],
    lonn: "Gjennomsnitt ca. 702 000 kr/år (SSB-stil estimat 2026)",
    patenter: "1 380 nye søknader – Kongsberg-effekten",
    gonzo:
      "Buskerud har Kongsberg – byen som gikk fra sølvgruver til våpensystemer og undervannsroboter. 400 år med hardware-tradisjon komprimert til én dalside.",
    videoTittel: "Gonzo Video: Buskerud Innovation 2026",
  },
  Østfold: {
    fylke: "Østfold",
    oppfinnelser: [
      "Resirkulering og sirkulærøkonomi (Fredrikstad)",
      "Næringsmiddelteknologi",
      "Solcellepaneler og energilagring",
    ],
    lonn: "Gjennomsnitt ca. 648 000 kr/år (SSB-stil estimat 2026)",
    patenter: "590 nye søknader",
    gonzo:
      "Østfold tar imot alt Norge kaster og gjør det om til råvarer igjen. Grenselandet som ble sirkulærøkonomiens verksted – uglamorøst, uunnværlig.",
    videoTittel: "Gonzo Video: Østfold Innovation 2026",
  },
  Finnmark: {
    fylke: "Finnmark",
    oppfinnelser: [
      "Arktisk logistikk og drone-inspeksjon",
      "Snøkrabbe- og kongekrabbe-teknologi",
      "LNG-prosessering (Melkøya)",
    ],
    lonn: "Gjennomsnitt ca. 655 000 kr/år (SSB-stil estimat 2026)",
    patenter: "210 nye søknader – få, men fryktløse",
    gonzo:
      "Finnmark: der alt som fungerer må tåle 30 minus og tre måneder uten sol. De som oppfinner ting her, oppfinner ting som virker. Resten av landet driver med beta-testing.",
    videoTittel: "Gonzo Video: Finnmark Innovation 2026",
  },
};

export function getFylkeData(fylke: string): FylkeData {
  return FYLKE_DATA[fylke as Fylke] ?? FYLKE_DATA.Vestland;
}
