# HERDEN — ditt multiagent-verksted

Herden er et lag av 9 spesialiserte KI-agenter + 20 skills som produserer research,
byggeprosjekter, sangtekster, bildeprompts, videoprompts og dagsplaner — koordinert,
kvalitetssikret og lagret i dette repoet.

## Slik er det bygget

```
.claude/
  skills/     ← 20 skills: oppskriftene agentene følger
  agents/     ← 9 agenter: spesialistene som gjør jobben
herden/
  oppdrag/    ← bestillingene (100-listene + 50-lista)
  resultater/ ← ferdige leveranser havner her
  STATUS.md   ← hva er gjort, hva gjenstår
```

## De 9 agentene

| Agent | Gjør | Bruker skills |
|---|---|---|
| **herde-koordinator** | Dirigenten — fordeler bolker, følger opp, godkjenner | herde-orkestrering, kvalitetskontroll, git-flyt |
| **forsker** | Dyp research med kilder | dyp-research |
| **github-speider** | Finner og vurderer GitHub-prosjekter | github-speiding |
| **byggmester** | Kloner/bygger prosjekter til de kjører | bygg-fra-repo, plan-forst, verifisering m.fl. |
| **tekstforfatter** | Sangtekster + musikk-prompts | sangtekster, musikk-prompts, tekst-polering |
| **bildekunstner** | Satiriske bildeprompts i gatekunst-stil | bilde-prompts |
| **videoregissor** | Videoprompts, 5–15 s scener | video-prompts |
| **dagsplanlegger** | Konkrete dagsplaner | dagsplanlegging |
| **kvalitetssjef** | Godkjenner eller returnerer leveranser | kvalitetskontroll |

## Slik bruker du Herden (kopier og lim inn i Claude Code)

**Kjøre en bolk av noe:**
> Bruk herde-koordinatoren til å produsere sangene 1–10 fra herden/oppdrag/100-sanger.md

**Research:**
> Bruk forsker-agenten på tema 91–95 fra herden/oppdrag/100-forskningstemaer.md

**Finne og bygge et prosjekt:**
> La github-speideren vurdere bolk 3 i herden/oppdrag/100-github-vibe-prosjekter.md,
> og la byggmesteren bygge det med høyest byggbarhetsscore

**Bilder/videoer:**
> Bildekunstneren tar bolk 1 (bilde 1–10) fra herden/oppdrag/100-bilder.md

**Dagsplan:**
> Dagsplanlegger: lag dagens plan basert på herden/oppdrag/50-ting-a-gjore-i-dag.md

**Full produksjonsdag (koordinatoren styrer alt):**
> Herde-koordinator: kjør neste ubehandlede bolk fra hver av oppdragslistene,
> kvalitetssikre, oppdater STATUS.md og push

## Arbeidsreglene (kort versjon)

1. **Bolker på 10** — aldri be om alle 100 på én gang; kvaliteten dør og filene kolliderer.
2. **Maks 3–4 agenter parallelt.**
3. **Alt kvalitetssikres** før det regnes som ferdig (kvalitetssjefen kan returnere).
4. **STATUS.md oppdateres** etter hver bolk — den er Herdens hukommelse mellom økter.
5. **Commit + push per bolk** — arbeid som ikke er pushet finnes ikke.

## Fra prompts til ferdige verk

- **Sanger**: Filene i `resultater/sanger/` har tekst + `## Prompt`. Lim teksten inn som
  lyrics og prompten som stilbeskrivelse i Suno/Udio. Generer 2–3 versjoner, behold den beste.
- **Bilder**: Prompts i `resultater/bilder/` limes rett inn i Midjourney/DALL·E/Ideogram/Flux.
- **Videoer**: Prompts i `resultater/videoer/` er skrevet for Sora/Veo/Runway/Kling.
- **Bygg**: Hvert prosjekt i `herden/bygg/` har README med kjørekommandoer.

## Etikk-kontrakten (gjelder alle agenter, alltid)

- Satire treffer makt og systemer — aldri privatpersoner, aldri hat mot grupper.
- Ingen ekte artistnavn i musikk-prompts, ingen «in the style of <kunstner>» i bildeprompts.
- Ingen hemmeligheter i git. Ingen batch mot betalte API-er uten ditt klarsignal.
