# Idébank syklus 1 — 15 ideer inn, én ut

Generert 2026-07-26. Rådata: `ideer.json`. Regenerer tabellen med:

```bash
python3 openclaw/runner/openclaw.py score prosjekter/syklus-01/ide-jakt/ideer.json
```

## Scoretabell

| Idé | 48h | robust | selgbar | patent | energi | Total | Dom |
|---|---|---|---|---|---|---|---|
| Riblet-Kalkulator | 9 | 8 | 7 | 6 | 8 | **7.70** | BYGG NÅ |
| Isvarsler for droneflyging (Vestland) | 8 | 8 | 6 | 2 | 8 | **6.50** | PARKER |
| Batteri-derating-kalkulator for kulde | 9 | 8 | 5 | 1 | 9 | **6.45** | PARKER |
| Riblet-film for droneskrog (fysisk) | 4 | 7 | 8 | 8 | 5 | **6.35** | PARKER |
| «Verktøykassa» — samlet nettsted | 8 | 9 | 6 | 0 | 7 | **6.25** | PARKER |
| Gonzo Suno-serie «SAKSNUMMER» | 10 | 5 | 5 | 0 | 9 | **6.15** | PARKER |
| PanicSafe PWA | 7 | 7 | 6 | 3 | 6 | **6.00** | PARKER |
| Vibe-kort PWA | 9 | 8 | 4 | 0 | 8 | **5.90** | PARKER |
| Dokumentasjonslogg for saksgang | 7 | 8 | 6 | 2 | 5 | **5.90** | PARKER |
| Kolibri-vinge simulator (2D) | 6 | 7 | 4 | 7 | 5 | **5.60** | PARKER |
| Sverm-koordinator SaaS | 2 | 4 | 9 | 8 | 2 | **5.30** | PARKER |
| Kolibri-vinge testrigg (fysisk) | 2 | 6 | 7 | 9 | 3 | **5.25** | PARKER |
| Vindtunnel-rigg (byggevifte + veiecelle) | 6 | 7 | 3 | 2 | 6 | **4.65** | DREP |
| AI-agent for Patentstyret-overvåking | 5 | 6 | 5 | 1 | 6 | **4.65** | DREP |
| Kurs: biomimicry-dronedeler | 3 | 6 | 7 | 0 | 3 | **4.20** | DREP |

## BYGG NÅ

**Riblet-Kalkulator (7.70)** — bygget ferdig i denne syklusen. Se
`prosjekter/syklus-01/riblet-kalkulator/`. Fungerende web-verktøy + verifisert
referanseimplementasjon med 10 tester. Neste fysiske handling: print testpaneler.

## Gravplass — med dødsårsak

Døde ideer slettes aldri. Dødsårsaken er det mest gjenbrukbare vi produserer: den forteller
nøyaktig hva som må endre seg for at ideen skal gjenoppstå.

| Idé | Dødsårsak | Gjenoppstår når |
|---|---|---|
| AI-agent for Patentstyret-overvåking | Løser et problem som oppstår fire ganger i året. Automatisering av sjeldne oppgaver er ren utsettelse forkledd som produktivitet. | Du har fem eller flere aktive patentspor samtidig |
| Kurs: biomimicry-dronedeler | Krever at verktøyene og målingene finnes først. Du kan ikke undervise i et resultat du ikke har målt. | Etter første verifiserte riblet-måling — da er kurset dokumentasjon, ikke gjetning |
| Vindtunnel-rigg | **Se anmerkning under — denne dommen er trolig feil.** | — |

## Anmerkning: modellen bommet på én idé, og det er verdt mer enn tabellen

Vindtunnel-riggen fikk 4.65 og dom DREP. Det er galt, og det er modellens feil, ikke ideens.

Riggen er ikke et produkt — den er en **enabler**. Uten den er hvert eneste tall i
riblet-kalkulatoren, i patentnotatene og i et framtidig kurs en gjetning. Den scorer lavt på
`selgbarhet` (3) fordi ingen kjøper den, og lavt totalt fordi selgbarhet har vekt 0.30.
Modellen straffer altså hardest det som gjør alt annet salgbart.

**Dette er en reell svakhet i scoringsmodellen**, oppdaget ved å faktisk kjøre den. Foreslått
rettelse til syklus 2 (går til `codex-msx` for vurdering):

> Ny akse `enabler_verdi` (vekt 0.10, tatt fra selgbarhet 0.30 → 0.25 og robusthet 0.15 → 0.10):
> «Hvor mange andre ideer i banken blir mulige eller mer troverdige hvis denne finnes?»
> Vindtunnel-riggen ville fått 9 der og landet rundt 5.5 — PARKER, ikke DREP.
> Riktig dom.

Inntil aksen er innført: **vindtunnel-riggen overlever manuelt overstyrt.** Den er
forutsetningen for hele riblet-sporet, og et 48-timers verktøy er verdiløst hvis tallene det
produserer aldri kan verifiseres.

Dette er hva loopen er til for. Én kjøring gjennom modellen avdekket en systematisk feil i
modellen selv — det er høyere verdi enn de femten ideene til sammen.

## Mønster i denne runden

1. **Kalkulator-klyngen er en merkevare, ikke tre verktøy.** Riblet + batteri-derating +
   isvarsel har samme kjøper, samme format, samme distribusjon. Bygget hver for seg er de tre
   småting; samlet under «Verktøykassa» er de en kanal med e-postliste. Det endrer
   selgbarhets-scoren for alle tre neste gang de vurderes.
2. **Patentverdien ligger konsekvent i det som bryter 48h-porten.** Kolibri-rigg (9), riblet-film
   (8), sverm (8) — alle blokkert av hardware eller regulering. Løsningen er ikke å senere
   porten, men å splitte hver av dem i en software-del som kan gjøres nå og en fysisk del som
   venter. Det er allerede gjort for kolibri (simulator vs. rigg) og bør gjøres for de to andre.
3. **Ingen idé scoret over 8.** Det betyr at idébanken mangler noe, ikke at ideene er dårlige.
   Neste `ide-jakt`-syklus bør tvinge fram minst fem ideer som starter fra en betalende kunde
   og jobber bakover, i stedet for fra en teknologi og framover.
