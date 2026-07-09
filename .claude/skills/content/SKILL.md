---
name: content
description: Generer innholdsutkast (poster, nyhetsbrev, beskrivelser) styrt av PLAYBOOK.md - de databekreftede vinnermønstrene. Brukes når brukeren skriver /content eller ber om innhold til publisering.
---

# Content

Produksjonssiden av Content-Factory-loopen: hvert utkast skal etterleve playbooken, så ukens publisering blir et gyldig eksperiment.

## Steg

1. Les `PLAYBOOK.md` (repo-rot). Finnes den ikke: kopier `self-improving-loops/04-content-factory-loop/PLAYBOOK.template.md` dit, be brukeren fylle ut `## Merkevare`, og stopp.
2. Avklar bestillingen hvis den mangler: hvor mange utkast, hvilket format/kanal, hvilke temaer.
3. Generer utkastene slik at hvert enkelt:
   - Følger ALLE `## Bekreftede mønstre`
   - Bevisst tester minst én hypotese fra `## Hypoteser under test` — og merk hvilken: `<!-- tester: <hypotese> -->` øverst i utkastet
   - Aldri bryter `## Forbudsliste`
   - Treffer stemmen og målgruppen i `## Merkevare`
4. Fordel hypotesetestingen: med 2 aktive hypoteser og 6 utkast, la ~halvparten teste hver — kontrast trenger begge sider.
5. Lagre utkastene i `content/uke-<nr>/` (én fil per utkast) og vis dem til brukeren.

## Regler

- Hypotese-kommentaren er obligatorisk — uten den kan ikke `/content-retro` dømme hypotesene etterpå.
- Ikke finn på nye mønstre underveis; har du en idé, foreslå den til brukeren som hypotese-kandidat i stedet for å bake den inn usporet.
