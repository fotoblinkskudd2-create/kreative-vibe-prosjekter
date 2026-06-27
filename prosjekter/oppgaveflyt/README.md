# Oppgaveflyt

Selvhostet, lettvekts oppgave- og prosjektstyring for små team. Se [`PLAN.md`](./PLAN.md)
for full arkitektur, GitHub-research og forklaring av designvalg.

## Kjøre lokalt

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run dev          # http://localhost:4000

# 3. Frontend (i et nytt terminalvindu)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Tester

```bash
cd backend && npm test
cd frontend && npm test
```

## Mappestruktur

```
backend/
  prisma/schema.prisma   # Database-modeller
  src/modules/auth/       # Registrering, innlogging, refresh/logout
  src/modules/tasks/      # Oppgaver, inkl. drag-and-drop move-endepunkt
  src/middleware/         # Auth-guard, sentral feilhåndtering
frontend/
  src/components/         # TaskBoard, TaskColumn, TaskCard
  src/hooks/               # useBoard, useMoveTask (TanStack Query)
  src/api/client.ts        # Fetch-wrapper med automatisk token-refresh
```
