# Oppgaveflyt – selvhostet prosjekt- og oppgavestyring for små team

Full-stack-applikasjon med detaljert arkitektur, GitHub-research og produksjonsklare
kodeeksempler. Selve kildekoden ligger i [`backend/`](./backend) og [`frontend/`](./frontend)
i denne mappen.

---

## 1. Problembeskrivelse

**Problemet:** Mindre team (3–15 personer) i frivillige organisasjoner, oppstartsprosjekter
og kreative initiativ (akkurat den typen prosjekter dette repoet samler) mangler ofte et
lettvekts verktøy for å holde oversikt over oppgaver, ansvar og fremdrift. Kommersielle
løsninger (Asana, Trello, Linear, ClickUp) krever abonnement per bruker og lagrer
prosjektdata hos en tredjepart, noe som ikke alltid er ønskelig for frivillige lag eller
prosjekter med sensitivt innhold. Regnskapsark og chat-tråder bryter sammen så snart antall
oppgaver og medlemmer øker forbi en håndfull.

**Hovedfunksjonalitet:**
- Brukerregistrering og innlogging (JWT access + refresh token)
- Arbeidsområder ("prosjekter") med flere medlemmer og roller (eier/medlem)
- Kanban-tavle per prosjekt med kolonner (Backlog → Pågår → Ferdig, konfigurerbart)
- Opprette, redigere, tildele, prioritere, sette frist og flytte oppgaver (drag-and-drop)
- Kommentarer og enkel aktivitetslogg per oppgave
- Rollebasert tilgangskontroll på prosjektnivå

**Målgruppe:** Små team, frivillige organisasjoner og kreative/idealistiske prosjekter som
trenger et enkelt, selvhostet alternativ til kommersielle prosjektstyringsverktøy, uten å
betale per bruker eller gi fra seg data til en tredjepart.

---

## 2. Arkitektur

### Frontend
| Valg | Versjon | Begrunnelse |
|---|---|---|
| React | 18.3 | Standard, stort økosystem |
| TypeScript | 5.5 | Typesikkerhet på tvers av stack |
| Vite | 5.3 | Rask dev-server og bygg |
| TanStack Query | 5.x | Server-state, caching, optimistiske oppdateringer |
| dnd-kit | 6.x | Tilgjengelig (a11y) drag-and-drop til Kanban-tavlen |
| Tailwind CSS | 3.4 | Rask, konsistent styling uten CSS-forvirring |
| Zustand | 4.x | Lett klient-state (UI), ikke serverdata |

Hovedkomponenter: `TaskBoard`, `TaskColumn`, `TaskCard`, `TaskDetailModal`, `LoginForm`,
`ProjectSidebar`. Se [`frontend/src/components`](./frontend/src/components).

### Backend
| Valg | Versjon | Begrunnelse |
|---|---|---|
| Node.js | 20 LTS | Aktiv LTS, stabil |
| Express | 4.19 | Enkelt, velkjent, lett å teste |
| TypeScript | 5.5 | Delte typer med frontend mulig via `shared` |
| Prisma | 5.16 | Typesikker ORM, gode migrasjoner |
| Zod | 3.23 | Input-validering med inferte typer |
| jsonwebtoken | 9.x | JWT access/refresh-token |
| bcryptjs | 2.4 | Passord-hashing uten native build-avhengigheter |
| helmet, cors, express-rate-limit | nyeste | Grunnleggende HTTP-sikkerhet |

Lagdelt arkitektur: **routes → controller → service → Prisma**. Hver feature (auth, tasks,
projects) er en egen modul under `backend/src/modules/<feature>` for å holde grensene
tydelige og gjøre det enkelt å teste service-laget isolert fra HTTP.

Hovedendepunkter:
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id/board

GET    /api/tasks?projectId=...
POST   /api/tasks
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/move      # drag-and-drop: ny kolonne + posisjon
DELETE /api/tasks/:id
```

### Database
PostgreSQL 16 + Prisma. Modeller: `User`, `Project`, `ProjectMember`, `Column`, `Task`,
`Comment`, `RefreshToken`. Full skjema i
[`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).

Nøkkelbeslutninger:
- `Task.position` er en `Float` (ikke heltallsindeks) slik at en omplassering bare krever å
  oppdatere én rad (gjennomsnitt av naboenes posisjoner), ikke reindeksere hele kolonnen.
- `RefreshToken` lagres som *hash* (ikke klartekst) i databasen, med `expiresAt` og
  `revokedAt`, slik at tokens kan tilbakekalles ved utlogging/passordbytte.
- `ProjectMember` er en explicit join-modell (ikke implicit many-to-many) fordi den bærer
  ekstra data (`role`).

### Deployering
- **Frontend:** Vercel – automatisk preview-deploy per PR, gratis tier er tilstrekkelig
- **Backend:** Railway eller Fly.io – Docker-container, enkel horisontal skalering senere
- **Database:** Neon eller Supabase – administrert PostgreSQL med gratis tier og branching
- **CI/CD:** GitHub Actions – lint + typecheck + test på hver PR, deploy ved merge til `main`
- **Secrets:** miljøvariabler i hosting-plattformens secret-store, aldri i repoet

---

## 3. GitHub-analyse

Fem relevante åpen kildekode-prosjekter ble undersøkt for arkitekturmønstre og
teknologivalg som er gjenbrukt eller bevisst forenklet i denne planen.

### [makeplane/plane](https://github.com/makeplane/plane)
- **Finding:** Next.js-frontend + Django REST-backend + PostgreSQL + Redis. Har egne
  mikrotjenester ("Gateway" som proxy mot databasen, "Pilot" for integrasjoner) og en
  separat AI-tjeneste. ~49k GitHub-stjerner, svært aktivt community.
- **Analyse:** Plane viser skalaen et "Linear/Jira-alternativ" kan vokse til, men
  mikrotjeneste-oppdelingen er overkill for et team på 3–15 personer. Vi låner mønsteret
  med **separate API-ressurser per domene** (issues/projects/cycles) og Redis til
  bakgrunnsjobber, men holder oss til en enkelt monolittisk backend-tjeneste i denne planen.

### [go-vikunja/vikunja](https://github.com/go-vikunja/vikunja)
- **Finding:** Go-backend (eget REST-API, Swagger-dokumentert) + Vue.js-frontend. Bevisst
  enkel installasjon (én binærfil for backend), støtter lister, Kanban og gjentakende
  oppgaver.
- **Analyse:** Vikunjas fokus på **enkel selv-hosting** (Docker Compose, ett config-filformat,
  god migrasjonsverktøy) er direkte relevant for målgruppen vår. Vi gjenbruker ideen om en
  enkelt `docker-compose.yml` for hele stacken og Swagger/OpenAPI-dokumentasjon av API-et.

### [JordanKnott/taskcafe](https://github.com/JordanKnott/taskcafe)
- **Finding:** Go-backend med GraphQL (gqlgen) + React-frontend (styled-components,
  react-beautiful-dnd) + PostgreSQL + Redis. JWT brukes til autentisering; token sendes i
  Authorization-header på hvert API-kall.
- **Analyse:** Taskcafe er arkitektonisk nærmest vår løsning (Kanban + PostgreSQL + JWT).
  Vi låner JWT-mønsteret direkte, men velger **REST i stedet for GraphQL** fordi
  team-størrelsen og antall ressurstyper ikke rettferdiggjør GraphQL-kompleksiteten, og
  **dnd-kit i stedet for react-beautiful-dnd** siden sistnevnte ikke er aktivt vedlikeholdt.

### [Leantime/leantime](https://github.com/Leantime/leantime)
- **Finding:** PHP/Laravel-monolitt + MySQL, designet spesifikt med nevrodivergente brukere
  (ADHD, autisme, dysleksi) i tankene – enkle visninger, lite kognitiv belastning.
- **Analyse:** Den tekniske stacken (PHP) er ikke relevant for oss, men
  **designfilosofien** er det: et minimum-viable UI med få, tydelige tilstander per
  oppgave (status, prioritet, frist) reduserer kognitiv last for frivillige team som ikke
  bruker verktøyet daglig. Dette påvirker `TaskCard`-designet (kun de viktigste feltene
  synlige, resten i en detalj-modal).

### [SagarSuryakantWaghmare/taskflow](https://github.com/SagarSuryakantWaghmare/taskflow)
- **Finding:** MERN-stack (MongoDB, Express, React, Node) todo-app med JWT-autentisering
  og CRUD. Et mindre, lærings-orientert prosjekt, men et representativt eksempel på det
  enkleste JWT + Express + React-mønsteret.
- **Analyse:** Brukt som referanse for **minimums-implementasjonen** av JWT-middleware i
  Express, men vi går videre med refresh-tokens i httpOnly-cookie (i stedet for kun
  access-token i localStorage) for bedre sikkerhet mot XSS – se avsnitt om sikkerhet under.

---

## 4. Kodeeksempler

Fullstendige, kjørbare filer ligger i repoet. Sammendrag av de fire påkrevde eksemplene:

| Krav | Fil |
|---|---|
| Backend API-endepunkt | [`backend/src/modules/tasks/tasks.controller.ts`](./backend/src/modules/tasks/tasks.controller.ts) + [`tasks.service.ts`](./backend/src/modules/tasks/tasks.service.ts) |
| Frontend React-komponent | [`frontend/src/components/TaskBoard.tsx`](./frontend/src/components/TaskBoard.tsx) |
| Database-modell | [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma) |
| Autentiseringsløsning | [`backend/src/middleware/auth.ts`](./backend/src/middleware/auth.ts) + [`backend/src/modules/auth/auth.service.ts`](./backend/src/modules/auth/auth.service.ts) |

### 4.1 Backend API-endepunkt: flytte en oppgave (drag-and-drop)

Dette endepunktet er valgt fordi det er det mest "interessante" i en Kanban-app: det må
oppdatere kolonne-tilhørighet og rekkefølge atomisk, og validere at brukeren har tilgang
til prosjektet oppgaven hører til.

```ts
// backend/src/modules/tasks/tasks.controller.ts (utdrag)
export async function moveTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = idParamSchema.parse(req.params);
    const { columnId, beforeTaskId, afterTaskId } = moveTaskSchema.parse(req.body);

    const task = await tasksService.moveTask({
      taskId,
      columnId,
      beforeTaskId,
      afterTaskId,
      requesterId: requireUserId(req),
    });

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
}
```

Se hele filen for service-laget som beregner ny `position` som gjennomsnittet av
nabo-oppgavenes posisjoner (O(1) oppdatering, ingen reindeksering av kolonnen).

### 4.2 Frontend React-komponent: `TaskBoard`

Henter tavle-data med TanStack Query, bruker dnd-kit for drag-and-drop, og gjør en
**optimistisk oppdatering** lokalt før serveren bekrefter flyttingen (se
`frontend/src/hooks/useMoveTask.ts`).

### 4.3 Database-modell

`Task`-modellen med `position: Float`, relasjon til `Column` og `User` (assignee), se full
`schema.prisma`.

### 4.4 Autentiseringsløsning

Access-token (JWT, 15 min, sendes i `Authorization: Bearer`) + refresh-token (7 dager,
httpOnly + `Secure` + `SameSite=Strict` cookie, hashet i databasen). Se
`auth.service.ts` og `middleware/auth.ts`.

---

## 5. Best practices

### Kodekvalitet og organisering
- Feature-mapper (`modules/auth`, `modules/tasks`) i stedet for lag-mapper
  (`controllers/`, `services/` på toppnivå) – enklere å navigere når antall features øker.
- Service-laget kjenner ikke til Express (`Request`/`Response`); det tar inn rene
  TypeScript-objekter og kaster domenefeil (`AppError`). Dette gjør service-laget
  enhetstestbart uten HTTP-mocking.
- Delte typer (f.eks. `Task`, `Project`) defineres én gang og kan i en reell monorepo-setup
  deles mellom frontend og backend via en `shared`-pakke eller generert OpenAPI-klient.
- ESLint (`@typescript-eslint`) + Prettier kjøres i pre-commit-hook (husky + lint-staged)
  og i CI – ingen formatteringsdiskusjoner i kodegjennomgang.

### Sikkerhet
- Passord hashes med bcrypt (cost factor 12), aldri lagret eller logget i klartekst.
- Refresh-tokens lagres som SHA-256-hash i databasen, slik at en database-leak ikke gir
  direkte tilgang til gyldige tokens.
- `helmet()` for sikre HTTP-headere, strikt CORS-allowlist (kun kjente frontend-origins),
  `express-rate-limit` på `/api/auth/*` for å bremse credential stuffing.
- All input valideres med Zod **før** den når service-laget – aldri stol på klientdata.
- Tilgangskontroll sjekkes i service-laget (ikke bare i UI): enhver tasks/projects-operasjon
  verifiserer at brukeren er medlem av prosjektet oppgaven hører til.
- Hemmeligheter (`JWT_SECRET`, `DATABASE_URL`) leses fra miljøvariabler og valideres ved
  oppstart med Zod (`env.ts`) – appen feiler raskt og tydelig hvis noe mangler, i stedet for
  å starte med `undefined`-hemmeligheter.

### Ytelse og optimalisering
- Prisma-spørringer bruker `select`/`include` eksplisitt for å unngå å hente unødvendige
  kolonner (spesielt `passwordHash` skal aldri følge med i et `User`-respons-objekt).
- `position: Float` på `Task` unngår O(n) reindeksering av en hel kolonne ved hver flytting.
- TanStack Query cacher prosjekt/tavle-data og gjør optimistiske oppdateringer ved
  drag-and-drop, slik at UI oppleves instant selv med nettverkslatens.
- Database-indekser på fremmednøkler som brukes i `WHERE`-klausuler (`Task.columnId`,
  `ProjectMember.userId`) – definert direkte i Prisma-skjemaet med `@@index`.

### Testing-strategi
- **Enhetstester** (Vitest) på service-laget: ren logikk, ingen HTTP, mocket Prisma-klient.
- **Integrasjonstester** (Vitest + Supertest) mot et ekte test-Postgres (Docker, eller
  Testcontainers) for de kritiske endepunktene (auth, move-task).
- **Komponenttester** (Vitest + React Testing Library) for `TaskBoard`/`TaskCard` –
  verifiserer at drag-and-drop trigger riktig API-kall, ikke at dnd-kit selv fungerer.
- **E2E** (Playwright) for de 2–3 mest kritiske brukerreisene (logg inn → opprett oppgave →
  flytt oppgave) kjørt i CI mot en deployet preview.

### Feilhåndtering
- Én sentral `errorHandler`-middleware i Express som mapper domenefeil (`AppError` med
  `statusCode`) til konsistente JSON-feilresponser (`{ error: { message, code } }`), og
  logger uventede feil (5xx) med stack trace uten å lekke dem til klienten.
- Zod-valideringsfeil mappes automatisk til 400 med feltspesifikke meldinger, slik at
  frontend kan vise feil ved riktig input-felt.
- Frontend bruker TanStack Querys `onError` + en global toast/notification for nettverks-
  og serverfeil, og skiller mellom "midlertidig feil, prøv igjen" og "ikke autorisert, logg
  inn på nytt" (401 trigger automatisk refresh-token-flow, deretter ny innlogging om det
  feiler).

---

## 6. Begynner- og avansert-tips

**For nybegynnere:**
- Start med å kjøre `docker-compose up` for PostgreSQL lokalt, kjør `prisma migrate dev` for
  å opprette skjema, og `npm run dev` i både `backend/` og `frontend/`.
- Test API-et med `backend/requests.http` (REST Client-format) eller Postman før du kobler
  på frontend – det er lettere å feilsøke ett lag i isolasjon.
- Les `auth.ts`-middlewaren linje for linje; å forstå JWT-flowen er nøkkelen til å forstå
  resten av sikkerhetsmodellen i appen.

**For viderekomne:**
- Bytt `position: Float` til en fraksjonsbasert ordningsalgoritme (f.eks. LexoRank) hvis
  appen skal skalere til svært mange samtidige brukere som flytter oppgaver i samme kolonne,
  for å unngå float-presisjonsproblemer i ekstreme tilfeller.
- Innfør WebSockets (Socket.IO eller native `ws`) for live-oppdatering av tavlen når flere
  brukere jobber samtidig, i stedet for polling via TanStack Query.
- Vurder CQRS-lett tilnærming: separate, optimaliserte read-modeller for tavle-visningen
  (én spørring som henter hele tavlen med kolonner+oppgaver) versus skrive-operasjoner som
  går gjennom full validering og tilgangskontroll.
