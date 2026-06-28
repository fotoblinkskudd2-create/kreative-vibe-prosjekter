# kreative-vibe-prosjekter
100+ ideelle prosjekter, musikkidéer, satire prosjekter, videoer og Vibe-kort apper. Inkluderer prototyper, salgsmateriell og klar-til-bygg info. Laget for brukeren.

## Genius Idea Engine v2.0

Kjør `/idea-engine-orchestrator` for å generere en ny, gonzo, patent/build-ready idé fra Alexander Bergens interessefelt (Arctic drone biomimicry, AI swarms, mental health tech, gonzo creative, iOS/fullstack, patents). Skillet er definert i `.claude/skills/idea-engine-orchestrator/SKILL.md`.

Hver kjøring sjekkes mot `ideas/LOG.md` for å tvinge ekte nyhet — ingen gjenbruk av tidligere idéer. Genererte idéer lagres som `ideas/NNNN-<slug>.md`.

Variant kan spesifiseres: Master (default), Patent Engine, Gonzo Creative Engine, eller OpenClaw Research Run.
