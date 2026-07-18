# 🔨 VIBESMIA — Den autonome kreative smia

Et multi-agent-system som forvandler rå kreative idéer til produksjonsklare
leveranser. Seks spesialiserte agenter samarbeider under én dirigent, med
tre-lags hukommelse og en original seleksjonsmekanisme: **Spenningsprotokollen**
— der produktiv uenighet mellom agentene, ikke konsensus, avgjør hvilke
konsepter som er gull.

## Kjør demoen (ingen avhengigheter)

```bash
cd vibesmia/src
python3 main.py "din rå idé her"
```

Eksempel:

```bash
python3 main.py "musikkvideo-generator for indie-artister med vibe-kort"
```

Demoen kjører offline med en deterministisk heuristikk-hjerne. Hver kjøring
skriver til `vibeminne.json` — systemet husker trender, hendelser og
destillerte oppskrifter mellom kjøringer.

## Produksjon med Claude API

```python
from vibesmia import Dirigenten
from vibesmia.adapters import ClaudeHjerne  # pip install anthropic

dirigent = Dirigenten(hjerne=ClaudeHjerne())  # Claude Opus 4.8, adaptiv tenkning
rapport = dirigent.smelt("satirisk nyhetskanal drevet av AI-agenter")
```

## Hvordan det virker

```
rå idé ──> SPEIDING ──> DIVERGENS ──> SPENNING ──> GULLSONEN ──> SMIING ──> ARKIVERING
           Speideren     Musen         Musen vs.    kun produktiv  Vibe-Vokteren  Arkivaren
           (trender)     (N konsepter) Provokatøren uenighet       + Smeden       (oppskrifter)
                                       (måles!)     overlever      (spesifikasjon)
```

Konsepter med for *lav* spenning er bleke («blast»), for *høy* er
ugjennomførbare («hybris»). Bare gullsonen smis videre.

Full arkitektur, designresonnement og kilder: [`docs/ARKITEKTUR.md`](docs/ARKITEKTUR.md)

## Struktur

```
vibesmia/
├── README.md              denne filen
├── docs/ARKITEKTUR.md     arkitektur, diagrammer, research-grunnlag
└── src/
    ├── main.py            demo-inngang
    └── vibesmia/
        ├── orchestrator.py  Dirigenten og Gullsmeltingen
        ├── agents.py        de seks agentene
        ├── tension.py       Spenningsprotokollen
        ├── memory.py        Vibe-Minnet (3 lag, JSON-persistens)
        ├── bus.py           meldingsbuss med proveniens-logg
        └── adapters.py      HeuristiskHjerne + ClaudeHjerne
```
