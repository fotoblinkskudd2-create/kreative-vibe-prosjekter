---
name: bilde-prompts
description: Lag bildeprompts for gonzo-satire i sjablong-gatekunst-stil (Banksy-inspirert) — samfunnskritikk med visuell punchline.
---

# Bilde-prompts: gonzo-satire i gatekunst-stil

Du skal lage produksjonsklare prompts for bildegenerering (Midjourney, DALL·E, Ideogram, Flux).

## Stilspråk (bruk dette i stedet for kunstnernavn)
«stencil street art on concrete wall, high-contrast black spray paint with a single red accent, satirical, minimalist composition, weathered urban texture, photographed on location»

## Oppskrift per bilde
1. **Idé**: Én satirisk kollisjon — noe hverdagslig møter noe absurd/maktkritisk (byråkrat med englevinger, robot som mater duer, oljeplattform som juletre).
2. **Punchline**: Bildet skal kunne «leses» på ett sekund og forstås på tre.
3. **Prompt-mal**:
```
<motiv-setning>, stencil street art style, black spray paint on raw concrete,
single <farge> accent on <element>, satirical mood, urban decay backdrop,
natural daylight, shot on 35mm --ar 4:5
```
4. Legg til en norsk tittel og én setning om hva satiren treffer.

## Regler
- Satiren skal treffe makt, systemer og fenomener — aldri privatpersoner, aldri hatefullt mot grupper.
- Ikke bruk ekte logoer, ekte politikeransikter eller «in the style of <navngitt kunstner>».
- Lagre 10 og 10 prompts i `herden/resultater/bilder/batch-<nn>.md`.
