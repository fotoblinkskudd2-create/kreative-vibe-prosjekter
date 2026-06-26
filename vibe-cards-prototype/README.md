# Vibe Cards — fullstack-prototype

Et lite "vibe-kort"-konsept: brukere lager korte stemningskort (tittel, mood,
farge, beskrivelse, tags), liker andres kort, og kan redigere/slette sine egne.
Bygget for rask prototyping — én `npm install` og du er i gang, ingen ekstern
database kreves.

## 1. Arkitektur

```
Browser (Vanilla JS, public/)  <--fetch-->  Express API (server.js, src/)  <-->  JSON-filbasert datalag (src/db.js)
```

- **Frontend**: Ren HTML/CSS/JS, ingen build-steg. Server'es statisk av Express.
- **Backend**: Node.js + Express. JWT-basert autentisering, bcrypt-hashede passord.
- **Database**: Et JSON-filbasert datalag (`data/db.json`) som følger nøyaktig
  samme datamodell som `schema.sql` (PostgreSQL-referanse). Dette gjør
  prototypen kjørbar uten ekstern DB-installasjon — for produksjon, bytt ut
  `src/db.js` med en `pg`/Prisma-klient mot skjemaet i `schema.sql`.
- **Autentisering**: Registrering/innlogging gir en JWT (`jsonwebtoken`),
  sendt som `Authorization: Bearer <token>`. Passord hashes med `bcryptjs`.

## 2. Installasjon

Krav: Node.js 18+.

```bash
cd vibe-cards-prototype
npm install
cp .env.example .env   # juster JWT_SECRET/PORT ved behov
npm start               # eller: npm run dev (auto-restart ved endringer)
```

Åpne `http://localhost:3000`. Tre eksempelkort er forhåndslastet ved første
oppstart (lagres i `data/db.json`, som ignoreres av git).

## 3. API-dokumentasjon

Alle endepunkter ligger under `/api`. Beskyttede endepunkter krever header
`Authorization: Bearer <token>`.

### Auth

| Metode | Endepunkt           | Auth | Body                              | Beskrivelse                  |
|--------|----------------------|------|------------------------------------|-------------------------------|
| POST   | `/api/auth/register` | Nei  | `{ name, email, password }`        | Opprett bruker, returnerer token |
| POST   | `/api/auth/login`    | Nei  | `{ email, password }`              | Logg inn, returnerer token   |
| GET    | `/api/auth/me`        | Ja   | —                                   | Hent innlogget bruker        |

### Cards

| Metode | Endepunkt              | Auth | Body / Query                                              | Beskrivelse                          |
|--------|-------------------------|------|-------------------------------------------------------------|----------------------------------------|
| GET    | `/api/cards`            | Nei  | `?mood=rolig` (valgfri)                                     | Liste over alle kort                  |
| GET    | `/api/cards/:id`        | Nei  | —                                                             | Hent ett kort                         |
| POST   | `/api/cards`            | Ja   | `{ title, mood, color, description?, tags? }`               | Opprett nytt kort                     |
| PUT    | `/api/cards/:id`        | Ja (eier) | Delvis subset av samme felter                          | Oppdater eget kort                    |
| DELETE | `/api/cards/:id`        | Ja (eier) | —                                                       | Slett eget kort                       |
| POST   | `/api/cards/:id/like`   | Ja   | —                                                             | Veksle like på et kort                |

Gyldige `mood`-verdier: `rolig`, `energisk`, `kreativ`, `nostalgisk`, `fokusert`.
`color` må være hex, f.eks. `#7FB3A8`.

Feilsvar har formen `{ "error": "..." }` eller `{ "errors": ["..."] }` med
passende HTTP-statuskode (400/401/403/404/409).

## 4. Brukseksempler

```bash
# Registrer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"hunter22"}'

# Logg inn (lagre token fra svaret)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"hunter22"}'

# Opprett kort
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Kveldsro","mood":"rolig","color":"#7FB3A8","description":"Te og bok.","tags":["kveld","ro"]}'

# Lik et kort
curl -X POST http://localhost:3000/api/cards/<CARD_ID>/like \
  -H "Authorization: Bearer <TOKEN>"
```

I nettleseren: registrer/logg inn via knappene øverst til høyre, filtrer kort
på mood med chips-raden, og klikk "+ Nytt kort" for å dele en egen vibe.

## 5. Videre arbeid (utenfor prototype-scope)

- Bytt `src/db.js` til ekte Postgres/Mongo for persistens i produksjon.
- Legg til paginering og søk for større datasett.
- Rate limiting og CSRF-vern før eksponering offentlig.
