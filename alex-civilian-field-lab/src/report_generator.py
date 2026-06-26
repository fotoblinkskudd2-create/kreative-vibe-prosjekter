"""Render the markdown reports for the civilian field-lab pipeline."""
from pathlib import Path


def _score_row(c):
    return (
        f"| {c['name']} | {c['domain']} | {c['value_score']} | {c['sales_potential']} "
        f"| {c['prototype_speed']} | {c['ip_potential']} | {c['customer_pain']} | {c['civilian_safety']} |"
    )


def render_concept_scores(scored, blocked, path):
    lines = [
        "# Concept Scores",
        "",
        "Verdiformel: `sales_potential*0.30 + prototype_speed*0.20 + ip_potential*0.20 "
        "+ customer_pain*0.20 + civilian_safety*0.10`",
        "",
        f"Totalt {len(scored) + len(blocked)} konsepter vurdert. {len(scored)} godkjent, {len(blocked)} blokkert av risk_filter.",
        "",
        "| Navn | Domene | Score | Salg | ProtoSpeed | IP | Kundesmerte | Sivil sikkerhet |",
        "|---|---|---|---|---|---|---|---|",
    ]
    lines += [_score_row(c) for c in scored]

    if blocked:
        lines += ["", "## Blokkert av risk_filter", ""]
        for b in blocked:
            lines.append(
                f"- **{b['name']}** - blokkert kategori: {b['_blocked_category']} "
                f"(treff på nøkkelord '{b['_blocked_keyword']}')"
            )

    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def render_top_ideas(scored, path, top_n=5):
    lines = ["# Top Ideas", "", f"Topp {top_n} konsepter rangert etter value_score.", ""]
    for i, c in enumerate(scored[:top_n], 1):
        lines += [
            f"## {i}. {c['name']} (score {c['value_score']})",
            f"- **Domene:** {c['domain']}",
            f"- **Kunde:** {c['customer']}",
            f"- **Problem:** {c['problem']}",
            f"- **Løsning:** {c['solution']}",
            f"- **Estimert kostnad prototype:** {c['estimated_cost']} NOK",
            "",
        ]
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def render_prototype_plan(plans, path):
    Path(path).write_text("\n\n".join(plans) + "\n", encoding="utf-8")


def build_sales_angle(concept):
    name = concept["name"]
    customer = concept["customer"]
    problem = concept["problem"]
    solution = concept["solution"]
    problem_short = problem if len(problem) <= 70 else problem[:67].rsplit(" ", 1)[0] + "..."
    problem_clause = problem.rstrip(".")

    return f"""## {name}

**Pitch (kort):** "{customer}" taper penger og tid fordi "{problem_clause}" oppdages for sent. {name} løser det ved at {solution.rstrip('.')}. En fungerende pilot kan testes på en konkret lokasjon innen 14 dager.

**E-post-emne:** Vil du teste en løsning på "{problem_short}" før neste sesong?

**Telefonåpning:** "Hei, jeg bygger {name} - en løsning som varsler {customer} før dette problemet blir dyrt. Har du 10 minutter denne uken til en kort gjennomgang?"

**Hvorfor dette ikke er bullshit:** {name} har en definert testprotokoll (se data/test_protocols.yaml), en konkret 14-dagers byggeplan og en estimert prototypekostnad på {concept['estimated_cost']} NOK - ikke et konsept på et lysbilde.
"""


def render_sales_angles(angles, path):
    Path(path).write_text("\n\n".join(angles) + "\n", encoding="utf-8")
