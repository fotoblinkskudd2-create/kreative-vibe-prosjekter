# kreative-vibe-prosjekter

100+ ideelle prosjekter, musikkidéer, satire prosjekter, videoer og Vibe-kort apper.
Inkluderer prototyper, salgsmateriell og klar-til-bygg info. Laget for brukeren.

Repoet kjøres av en **multi-modell orkestreringskjerne**: Claude planlegger og
reviewer, Codex utfører lange løkker, Foci hoster alltid-på runtime. Minne er
persistent tilstand. Kostnad er begrensningen.

## Kom i gang

```bash
# Hvilken motor og modell skal ta oppgaven?
python3 orchestration/route.py "refactor vibe-kort-rendereren" --files 12 --risk high

# Er minnet rent? (linjebudsjett, format, ingen hemmeligheter)
python3 orchestration/memlint.py

# Tester
python3 -m unittest discover -s orchestration/tests -t orchestration
```

Ingen avhengigheter. Python 3.11+ og standardbiblioteket.

## Struktur

| Sti | Innhold |
| --- | --- |
| `CLAUDE.md` | Kjernen for Claude Code — direktiver, ruting, kostnadskontroll, minneregler |
| `AGENTS.md` | Codex custom instructions — utførelsesløkka, verifisering, git |
| `foci/` | Foci agent-identitet (`IDENTITY.md`, `SOUL.md`) og config-mal |
| `memory/` | Varig tilstand: beslutninger, konvensjoner, kjente feil, API-kontrakter, preferanser |
| `orchestration/` | `policy.toml` (all ruting- og kostnadslogikk), `route.py`, `memlint.py`, tester |
| `docs/` | `routing.md`, `cost-control.md`, `operating-loop.md` |

## Modellstige

Billigst først. Eskaler kun på en feilet kvalitetsport, aldri på magefølelse.

```
claude-haiku-4-5  →  claude-sonnet-5  →  claude-opus-5
```

`claude-fable-5` velges aldri automatisk — den koster mer enn Opus-nivå og krever
`--model claude-fable-5` eksplisitt.

Priser og kontekstgrenser ligger i `orchestration/policy.toml` under `[models.*]`.
De er cachet 2026-06-24 — verifiser mot
<https://platform.claude.com/docs/en/pricing> før du oppgir absolutte tall.

## Prinsipper

- Sannhet før høflighet. Fakta før narrativ.
- Billigste motor som klarer kvalitetskravet.
- Aldri finn opp en kapabilitet, versjon, pris eller skjema — merk den uverifisert.
- Aldri mist varig tilstand. Aldri forurens kontekst med støy.
- Ingen hemmeligheter i noen fil. `memlint.py` feiler bygget på dem.

## Uverifisert

`foci/config.example.toml` er en **mal**. Nøkkelnavnene er ikke validert mot noen
installert Foci-build — sjekk dem mot runtime-dokumentasjonen før deploy, og skriv
korreksjonene inn i `memory/known-issues.md`.
