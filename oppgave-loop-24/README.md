# OPPGAVE-LOOP-24 🔥

**24-timers AI-drevet coding marathon** – drevet av Claude (Anthropic).

Kombinerer strukturert oppgave-loop, poeng-system, automatisk vanskelighetsramp og full sesjonssporing.

---

## Kom i gang på 3 minutter

### 1. Klon og sett opp

```bash
cd oppgave-loop-24
cp .env.example .env
# Rediger .env og lim inn din ANTHROPIC_API_KEY

# Sett opp Python-miljø
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Fyll inn dine inputs

Rediger `config/mine_inputs.yaml` – dette er din private konfig:

```yaml
bruker:
  navn: "Alexander"
fokus:
  - "Python"
  - "React"
sesjonsmaal: "Bygge SaaS dashboard"
startnivaа: 4
```

### 3. Start loopen

```bash
# Enkel start
bash scripts/start.sh

# Eller direkte
python3 main.py start
```

---

## Kommandoer i loopen

| Kommando | Handling |
|----------|----------|
| `NEXT` / `KONTINUER` | Neste oppgave |
| `FULL CODE` | Fullstendig løsning fra Claude |
| `HARDER` | Øk vanskelighetsgrad umiddelbart |
| `EASIER` | Senk vanskelighetsgrad |
| `HINT` | Hint uten full løsning |
| `REVIEW [kode]` | La Claude vurdere koden din |
| `STATUS` | Vis statistikk |
| `24H SUMMARY` | Full oppsummering |
| `STOPP` / `AVSLUTT` | Lagre og avslutt |

---

## Automatisk 24h ping-loop

For ekte uovervåket 24h loop som kjører i bakgrunnen:

```bash
# Start vanlig sesjon først, noter session ID
python3 main.py start

# Kjør automatisk ping hvert 60. minutt
python3 scripts/ping_loop.py --session 20241230_143000

# Tilpass interval (minutter)
python3 scripts/ping_loop.py --session 20241230_143000 --interval 30
```

---

## Se tidligere sesjoner

```bash
python3 main.py sessions          # List alle sesjoner
python3 main.py summary SESSION_ID # Vis oppsummering
python3 main.py start --resume SESSION_ID  # Fortsett sesjon
```

---

## Struktur

```
oppgave-loop-24/
├── main.py                 # CLI entrypoint
├── requirements.txt
├── .env.example            # API-nøkkel mal
├── config/
│   └── mine_inputs.yaml    # Dine private inputs
├── prompts/
│   └── system_prompt_no.md # OPPGAVE-LOOP-24 system prompt
├── scripts/
│   ├── start.sh            # Enkel launcher
│   └── ping_loop.py        # Automatisk 24h loop
├── sessions/               # Sesjonsfiler (gitignored)
└── src/
    ├── api_client.py       # Claude API-integrasjon
    ├── loop_engine.py      # Kjernelogikk
    ├── renderer.py         # Terminal UI (Rich)
    └── session_state.py    # Sesjonspersistering
```

---

## 24-timers struktur

| Timer | Fase | Fokus |
|-------|------|-------|
| 1–8 | Høy energi ⚡ | Grunnleggende + medium |
| 9–16 | Deep work 🔥 | Vanskelig + mini-prosjekter |
| 17–20 | Refleksjon 🧠 | Optimalisering + review |
| 21–24 | Wrap-up 🏁 | Review + neste dag plan |

---

Bergen-stil: No shit, bare action. 🔥
