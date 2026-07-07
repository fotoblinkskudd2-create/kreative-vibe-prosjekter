#!/usr/bin/env python3
"""
Verdi-dashboard — skanner Notion og/eller Google Drive (og/eller en lokal mappe),
finner mønstre i prosjektene dine, estimerer ROI/verdi og foreslår neste tasks.

Output: dashboard.html (åpne i nettleser) + verdi_rapport.md.

Bruk:
    export ANTHROPIC_API_KEY=sk-ant-...

    # Én eller flere kilder (alle er valgfrie, minst én må gi treff):
    export NOTION_TOKEN=ntn_...                      # Notion-integrasjon (les-tilgang)
    export GDRIVE_SERVICE_ACCOUNT_JSON=creds.json    # Google service account
    python verdi_dashboard.py --folder ~/Documents/prosjekter
"""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path

import anthropic

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
client = anthropic.Anthropic()


# ---------------------------------------------------------------- Kilder

def scan_notion(limit: int = 100) -> list[dict]:
    """Henter side-titler + sist endret via Notions søke-API."""
    token = os.environ.get("NOTION_TOKEN")
    if not token:
        return []
    import requests

    items, cursor = [], None
    while len(items) < limit:
        payload = {"page_size": min(100, limit - len(items))}
        if cursor:
            payload["start_cursor"] = cursor
        resp = requests.post(
            "https://api.notion.com/v1/search",
            headers={
                "Authorization": f"Bearer {token}",
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )
        if not resp.ok:
            print(f"  ! Notion-feil {resp.status_code}: {resp.text[:200]}")
            break
        data = resp.json()
        for page in data.get("results", []):
            title = ""
            props = page.get("properties", {})
            for prop in props.values():
                if prop.get("type") == "title" and prop.get("title"):
                    title = "".join(t.get("plain_text", "") for t in prop["title"])
                    break
            items.append({
                "kilde": "notion",
                "tittel": title or "(uten tittel)",
                "endret": page.get("last_edited_time", ""),
                "url": page.get("url", ""),
            })
        cursor = data.get("next_cursor")
        if not data.get("has_more"):
            break
    print(f"  Notion: {len(items)} sider")
    return items


def scan_gdrive(limit: int = 100) -> list[dict]:
    """Lister filer via Google Drive API (service account)."""
    creds_path = os.environ.get("GDRIVE_SERVICE_ACCOUNT_JSON")
    if not creds_path or not Path(creds_path).exists():
        return []
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        print("  ! Google Drive hoppet over: pip install google-api-python-client google-auth")
        return []

    creds = service_account.Credentials.from_service_account_file(
        creds_path, scopes=["https://www.googleapis.com/auth/drive.readonly"]
    )
    service = build("drive", "v3", credentials=creds)
    result = service.files().list(
        pageSize=limit,
        fields="files(name, mimeType, modifiedTime, webViewLink)",
        orderBy="modifiedTime desc",
    ).execute()
    items = [
        {
            "kilde": "gdrive",
            "tittel": f["name"],
            "endret": f.get("modifiedTime", ""),
            "url": f.get("webViewLink", ""),
        }
        for f in result.get("files", [])
    ]
    print(f"  Google Drive: {len(items)} filer")
    return items


def scan_folder(folder: str, limit: int = 200) -> list[dict]:
    """Fallback/tillegg: skann en lokal mappe for dokumenter og prosjekter."""
    root = Path(folder).expanduser()
    if not root.exists():
        return []
    exts = {".md", ".txt", ".pdf", ".docx", ".pages", ".key", ".numbers", ".html"}
    items = []
    for p in sorted(root.rglob("*"), key=lambda p: p.stat().st_mtime, reverse=True):
        if p.is_file() and p.suffix.lower() in exts:
            items.append({
                "kilde": "lokal",
                "tittel": str(p.relative_to(root)),
                "endret": datetime.fromtimestamp(p.stat().st_mtime).isoformat(),
                "url": str(p),
            })
            if len(items) >= limit:
                break
    print(f"  Lokal mappe: {len(items)} filer")
    return items


# ---------------------------------------------------------------- Analyse

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "monstre": {"type": "array", "items": {"type": "string"}},
        "temaer": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "navn": {"type": "string"},
                    "antall": {"type": "integer"},
                    "verdi_vurdering": {"type": "string"},
                    "roi_score": {"type": "integer"},
                },
                "required": ["navn", "antall", "verdi_vurdering", "roi_score"],
                "additionalProperties": False,
            },
        },
        "skjulte_gullkorn": {"type": "array", "items": {"type": "string"}},
        "neste_tasks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "task": {"type": "string"},
                    "hvorfor": {"type": "string"},
                    "estimert_tid": {"type": "string"},
                    "prioritet": {"type": "integer"},
                },
                "required": ["task", "hvorfor", "estimert_tid", "prioritet"],
                "additionalProperties": False,
            },
        },
        "verdi_oppsummering": {"type": "string"},
    },
    "required": ["monstre", "temaer", "skjulte_gullkorn", "neste_tasks",
                 "verdi_oppsummering"],
    "additionalProperties": False,
}


def analyze(items: list[dict]) -> dict:
    inventory = "\n".join(
        f"- [{i['kilde']}] {i['tittel']} (endret {i['endret'][:10]})" for i in items
    )
    response = client.messages.create(
        model=MODEL,
        max_tokens=16000,
        thinking={"type": "adaptive"},
        system=(
            "Du er en porteføljeanalytiker for en kreativ gründer med mange ideer "
            "(apper, musikk, satire, ideelle prosjekter). Du finner mønstre, vurderer "
            "kommersiell og ideell verdi, og foreslår neste konkrete steg. Norsk."
        ),
        messages=[{
            "role": "user",
            "content": f"""Her er innholdsfortegnelsen over mine prosjekter og notater
({len(items)} elementer fra Notion/Drive/lokalt):

{inventory}

Analyser: Hvilke mønstre og temaer går igjen? Hva har høyest ROI-potensial (score 1-10)?
Hvilke skjulte gullkorn bør løftes frem? Hva er de 5-8 viktigste neste tasks?
Gi roi_score per tema og prioritet 1 (høyest) til 3 per task.""",
        }],
        output_config={"format": {"type": "json_schema", "schema": ANALYSIS_SCHEMA}},
    )
    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)


# ---------------------------------------------------------------- Rapporter

def write_report(analysis: dict, items: list[dict], out_dir: Path) -> None:
    md = [f"# Verdi-rapport — {datetime.now():%d.%m.%Y}",
          "", analysis["verdi_oppsummering"], "", "## Mønstre"]
    md += [f"- {m}" for m in analysis["monstre"]]
    md += ["", "## Temaer og ROI", "", "| Tema | Antall | ROI (1-10) | Vurdering |",
           "|---|---|---|---|"]
    for t in sorted(analysis["temaer"], key=lambda x: -x["roi_score"]):
        md.append(f"| {t['navn']} | {t['antall']} | {t['roi_score']} | {t['verdi_vurdering']} |")
    md += ["", "## Skjulte gullkorn"]
    md += [f"- 💎 {g}" for g in analysis["skjulte_gullkorn"]]
    md += ["", "## Neste tasks"]
    for task in sorted(analysis["neste_tasks"], key=lambda x: x["prioritet"]):
        md.append(f"- **P{task['prioritet']}** {task['task']} — {task['hvorfor']} "
                  f"_({task['estimert_tid']})_")
    (out_dir / "verdi_rapport.md").write_text("\n".join(md), encoding="utf-8")


def write_dashboard(analysis: dict, items: list[dict], out_dir: Path) -> None:
    temaer = sorted(analysis["temaer"], key=lambda x: -x["roi_score"])
    tema_cards = "".join(
        f"""<div class="card"><h3>{t['navn']}</h3>
        <div class="score">ROI {t['roi_score']}/10</div>
        <div class="bar"><div style="width:{t['roi_score'] * 10}%"></div></div>
        <p>{t['verdi_vurdering']}</p><small>{t['antall']} elementer</small></div>"""
        for t in temaer
    )
    tasks = "".join(
        f"<li><span class='pri p{t['prioritet']}'>P{t['prioritet']}</span> "
        f"<strong>{t['task']}</strong><br><small>{t['hvorfor']} · {t['estimert_tid']}</small></li>"
        for t in sorted(analysis["neste_tasks"], key=lambda x: x["prioritet"])
    )
    gull = "".join(f"<li>💎 {g}</li>" for g in analysis["skjulte_gullkorn"])
    monstre = "".join(f"<li>{m}</li>" for m in analysis["monstre"])

    html = f"""<!doctype html><html lang="no"><head><meta charset="utf-8">
<title>Verdi-dashboard</title><style>
 body {{ font-family: -apple-system, sans-serif; background: #12121f; color: #eee;
        max-width: 1100px; margin: 0 auto; padding: 32px 20px; }}
 h1 {{ background: linear-gradient(90deg, #a29bfe, #fd79a8);
      -webkit-background-clip: text; background-clip: text; color: transparent; }}
 .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
         gap: 16px; }}
 .card {{ background: #1d1d30; border-radius: 16px; padding: 20px;
         border: 1px solid #2e2e4a; }}
 .card h3 {{ margin-top: 0; color: #a29bfe; }}
 .score {{ font-size: 1.4em; font-weight: 700; color: #fd79a8; }}
 .bar {{ background: #2e2e4a; border-radius: 6px; height: 8px; margin: 8px 0; }}
 .bar div {{ background: linear-gradient(90deg, #a29bfe, #fd79a8); height: 8px;
            border-radius: 6px; }}
 ul {{ line-height: 1.9; }}
 .pri {{ border-radius: 6px; padding: 1px 8px; font-size: 0.8em; font-weight: 700; }}
 .p1 {{ background: #e17055; }} .p2 {{ background: #fdcb6e; color: #222; }}
 .p3 {{ background: #636e72; }}
 section {{ margin-top: 40px; }}
</style></head><body>
<h1>📊 Verdi-dashboard</h1>
<p>{analysis['verdi_oppsummering']}</p>
<p><small>Generert {datetime.now():%d.%m.%Y %H:%M} · {len(items)} elementer skannet</small></p>
<section><h2>Temaer etter ROI</h2><div class="grid">{tema_cards}</div></section>
<section><h2>Neste tasks</h2><ul>{tasks}</ul></section>
<section><h2>Skjulte gullkorn</h2><ul>{gull}</ul></section>
<section><h2>Mønstre</h2><ul>{monstre}</ul></section>
</body></html>"""
    (out_dir / "dashboard.html").write_text(html, encoding="utf-8")


# ---------------------------------------------------------------- Main

def main() -> None:
    parser = argparse.ArgumentParser(description="Skann Notion/GDrive/mappe og lag verdirapport")
    parser.add_argument("--folder", help="Lokal mappe som skal skannes (i tillegg/fallback)")
    parser.add_argument("--limit", type=int, default=100, help="Maks elementer per kilde")
    args = parser.parse_args()

    print("🔍 Skanner kilder...")
    items = scan_notion(args.limit) + scan_gdrive(args.limit)
    if args.folder:
        items += scan_folder(args.folder, args.limit)

    if not items:
        print("Ingen kilder ga treff. Sett NOTION_TOKEN / GDRIVE_SERVICE_ACCOUNT_JSON "
              "eller bruk --folder <mappe>.")
        return

    print(f"🧠 Analyserer {len(items)} elementer med Claude...")
    analysis = analyze(items)

    out_dir = Path(__file__).parent / "output"
    out_dir.mkdir(exist_ok=True)
    write_report(analysis, items, out_dir)
    write_dashboard(analysis, items, out_dir)

    print(f"\n✅ Ferdig!")
    print(f"   open {out_dir / 'dashboard.html'}")
    print(f"   {out_dir / 'verdi_rapport.md'}")


if __name__ == "__main__":
    main()
