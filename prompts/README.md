# Mega-prompts for Codex & Claude Code

10 ferdige prompt-maler bygget på Ruthless Engine / Vibe Coding-stilen, med
minneblokken allerede inlinet i hver eneste fil.

**Slik bruker du dem:** åpne filen, kopier hele kodeblokken, fyll ut
`<<< LIM INN OPPGAVEN HER >>>`, kjør. Ingenting annet er påkrevd.

## Indeks

| # | Prompt | Bruk når |
| --- | --- | --- |
| [01](01-feature-implementer.md) | Ultimate Feature Implementer | Ny feature, runnable på første forsøk |
| [02](02-bug-investigator.md) | Deep Bug Investigator & Fixer | Rot-årsak med bevis, ikke gjetting |
| [03](03-refactorer.md) | Intelligent Refactorer & Modernizer | Strukturen suger, oppførselen skal bevares |
| [04](04-system-architect.md) | Principal System Architect | Arkitekturvalg som må holde i årevis |
| [05](05-production-code-generator.md) | Production-Ready Code Generator | Bare koden — ferdig, med tester |
| [06](06-security-auditor.md) | Security Auditor & Hardener | Før launch / før betalinger går live |
| [07](07-performance-optimizer.md) | Performance & Scalability Optimizer | Henger, stammer, eller koster for mye |
| [08](08-api-designer.md) | API Designer & Integrator | Edge Functions, Grok, RevenueCat, tredjepart |
| [09](09-documentation-memory-keeper.md) | Living Documentation & Memory Keeper | Koden har løpt fra minnet ditt |
| [10](10-agentic-multifile-workflow.md) | Agentic Multi-File Coding Workflow | Agent-modus, mange filer på tvers |

[`00-minneblokk.md`](00-minneblokk.md) inneholder den kanoniske minneblokken og
plassholder-konvensjonen. Endrer du noe der, speil endringen i `01`–`10`.

## Designvalg

- **Minneblokken er inlinet i hver prompt.** Du skal kopiere ett sted, ikke to.
  Prisen er duplisering — derfor ligger fasiten i `00-minneblokk.md`.
- **Fast output-struktur per prompt.** Samme overskrifter hver gang gjør svarene
  diffbare mot hverandre og lette å skumme.
- **Hver prompt ender i «Memory Update».** Beslutninger som tas underveis skal
  tilbake til Notion, ikke forsvinne i en chat-logg.
- **Prompt-kroppene er på engelsk, rammen på norsk.** Modellene følger engelske
  instruksjoner mest presist; du leser norsk raskest.

## Stacken promptene antar

React Native + Expo · Supabase (Auth, DB, Realtime, Storage, Edge Functions) ·
TanStack Query · Grok API · RevenueCat · monorepo `/app`, `/components`,
`/lib`, `/supabase`.

Jobber du på noe annet, bytt ut stack-linjene i minneblokken før du kjører.
