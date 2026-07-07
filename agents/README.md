# AI-agenter (Python + Claude API)

Fire kjørbare agenter. Felles oppsett:

```bash
cd agents
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...        # fra console.anthropic.com
```

Alle bruker modellen `claude-opus-4-8` (overstyr med `export CLAUDE_MODEL=...`).

## 1. `eu_problem_lab/` — multi-agent for EU/globalt problem (Task 2)

Researcher (web-søk) → Analyst → Pitcher → Executor.

```bash
python eu_problem_lab/eu_problem_lab.py "Matsvinn i EU"
```

Output: `output/<slug>/01_research.md … 04_eksekveringsplan.md` + `rapport.html`
(⌘P → PDF). Sett `NOTION_TOKEN` + `NOTION_PARENT_PAGE_ID` for automatisk Notion-side.
GitHub-output: commit og push output-mappen.

## 2. `verdi_dashboard/` — skanner Notion/GDrive, finner mønstre + ROI (Task 3)

```bash
export NOTION_TOKEN=ntn_...                          # valgfritt
export GDRIVE_SERVICE_ACCOUNT_JSON=creds.json        # valgfritt (pip install google-api-python-client google-auth)
python verdi_dashboard/verdi_dashboard.py --folder ~/Documents/prosjekter
```

Output: `output/dashboard.html` (mørkt dashboard med ROI-kort og neste tasks)
+ `output/verdi_rapport.md`.

- Notion-token: notion.so/my-integrations → ny integrasjon → del sidene dine med den.
- GDrive: service account i Google Cloud Console → del mappene med kontoens e-post.

## 3. `idea_to_prototype/` — idé → full prototype (Task 4)

```bash
python idea_to_prototype/idea2proto.py "Vibe-kort app der venner sender daglige stemningskort"
```

Output i `prototypes/<slug>/`:
- `app/` — kjørbar web-prototype (åpne `index.html`)
- `landing/index.html` — landingsside med påmelding
- `MONETISERING.md` — forretningsmodell, prising, valideringsplan

## 4. `meta_agent/` — master-agent som leser inputs og kjører neste tasks (Task 6)

```bash
mkdir -p meta_agent/inputs
# Legg notater/ideer som .md/.txt i inputs/
python meta_agent/meta_agent.py --plan     # se planen (tasks.json)
python meta_agent/meta_agent.py            # kjør de 3 øverste taskene
python meta_agent/meta_agent.py --replan   # ny plan fra oppdaterte inputs
```

Meta-agenten genererer en prioritert task-liste fra notatene dine og **utfører** dem:
prototype-tasks delegeres til `idea2proto`, dokument-tasks skrives direkte til
`outputs/`. Status lagres i `tasks.json`, så du kan kjøre den igjen og igjen.
