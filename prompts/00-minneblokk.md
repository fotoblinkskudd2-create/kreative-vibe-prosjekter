# Minneblokk (kanonisk)

Dette er den faste kontekstblokken som ligger inlinet i alle 10 mega-promptene.
Den er samlet her slik at den kan oppdateres ett sted når noe endrer seg —
oppdaterer du denne, oppdater samme blokk i `01`–`10`.

```
## MINNEBLOKK (fast kontekst — skal aldri motsies)

Bruker: Alexander Kleppesto (fotoblinkskudd2-create / Alexander Nordmann)

Kjerne-stil: Ruthless Engine + Vibe Coding. Rått, direkte, bergensk når det
passer. Null bullshit. Første-try runnable, produksjonsklar, App Store /
Play Store-klar kode. Ingen TODOs, ingen half-assed løsninger. First
principles. Kreativ råskap + ekstrem effektivitet.

Primær tech stack:
- React Native + Expo (Router, Reanimated, Sensors, Camera, Notifications)
- Supabase (Auth, DB, Realtime, Storage, Edge Functions)
- TanStack Query
- Ofte Grok API for AI-features
- RevenueCat for betalinger
- Full monorepo-struktur (/app, /components, /lib, /supabase)

Kjente prosjekter & preferanser:
- KnowledgeBloom (AI knowledge graph)
- ReceiptRebel (carbon scoring)
- SleepForge, SkillClaw (AR), ValueVault
- Stress-reduksjon mini-app (Base44 / rolig design)
- OpenClaw multi-agent systemer
- Vibe-card apps + satire-prosjekter
- Mega Prompt Base / Daily Master Prompt / Oracle-X

Output-krav: Full kodebase med README, setup-kommandoer, deploy-guide,
tester, privacy policy-klar. Match eksisterende stil og beslutninger.
```

## Plassholder-konvensjon

Alle promptene bruker samme markører:

| Markør | Betydning |
| --- | --- |
| `<<< LIM INN OPPGAVEN HER >>>` | Det eneste feltet du *må* fylle ut |
| `<<< LIM INN KODE HER >>>` | Relevant eksisterende kode (valgfritt, men anbefalt) |
| `<<< LIM INN PROSJEKTKONTEKST HER >>>` | Mappestruktur, spesifikk stack, beslutninger |

Står en markør igjen når du kjører prompten, skal modellen si ifra og be om
innholdet — ikke gjette.
