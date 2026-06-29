"""Generer markdown-rapporter for den sivile feltlab-pipelinen."""
from pathlib import Path


def _fmt_nok(amount):
    """Formater NOK-beløp med tusenskillere."""
    return f"{amount:,.0f}".replace(",", " ")


def _score_row(c):
    rev = _fmt_nok(c.get("est_annual_revenue_nok", 0))
    pb = c.get("payback_months", "—")
    return (
        f"| {c['name']} | {c['domain']} | **{c['value_score']}** | {c['sales_potential']} "
        f"| {c['prototype_speed']} | {c['ip_potential']} | {c['customer_pain']} "
        f"| {c['civilian_safety']} | {rev} NOK | {pb} mnd |"
    )


def render_concept_scores(scored, blocked, path):
    lines = [
        "# Konseptscorer — Sivil Feltlab",
        "",
        "**Verdiformel:**",
        "```",
        "value_score = sales_potential×0.30 + prototype_speed×0.20",
        "             + ip_potential×0.20 + customer_pain×0.20 + civilian_safety×0.10",
        "prototype_speed = 11 − prototype_difficulty  (rask bygging = høy score)",
        "```",
        "",
        f"**Totalt {len(scored) + len(blocked)} konsepter vurdert:** "
        f"{len(scored)} godkjent · {len(blocked)} blokkert av risk_filter.",
        "",
        "| Navn | Domene | Score | Salg | ProtoSpeed | IP | Smerte | Sikker | Est. omsetning/år | Tilbakebetaling |",
        "|---|---|---|---|---|---|---|---|---|---|",
    ]
    lines += [_score_row(c) for c in scored]

    if blocked:
        lines += ["", "## Blokkert av risk_filter", ""]
        for b in blocked:
            lines.append(
                f"- **{b['name']}** — blokkert kategori: *{b['_blocked_category']}* "
                f"(treff på nøkkelord «{b['_blocked_keyword']}»)"
            )

    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def render_top_ideas(scored, path, top_n=5):
    lines = [
        "# Topp idéer — Sivil Feltlab",
        "",
        f"De {min(top_n, len(scored))} beste konseptene rangert etter value_score.",
        "",
    ]
    for i, c in enumerate(scored[:top_n], 1):
        rev = _fmt_nok(c.get("est_annual_revenue_nok", 0))
        pb = c.get("payback_months", "—")
        lines += [
            f"## {i}. {c['name']}",
            f"> Score: **{c['value_score']}** · Kundesmerte: **{c['customer_pain']}/10** "
            f"· Salgspotensial: **{c['sales_potential']}/10**",
            "",
            f"| Felt | Verdi |",
            f"|---|---|",
            f"| Domene | {c['domain']} |",
            f"| Kunde | {c['customer']} |",
            f"| Problem | {c['problem']} |",
            f"| Løsning | {c['solution']} |",
            f"| Prototypekostnad | {_fmt_nok(c['estimated_cost'])} NOK |",
            f"| Est. år 1-omsetning | {rev} NOK |",
            f"| Estimert tilbakebetaling | {pb} måneder |",
            f"| IP-potensial | {c['ip_potential']}/10 |",
            f"| Sivil sikkerhet | {c['civilian_safety']}/10 |",
            "",
        ]
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def render_prototype_plan(plans, path):
    header = [
        "# Prototypeplaner — 14-dagersformat",
        "",
        "Tre konkrete 14-dagersplaner for de høyest scorende konseptene.",
        "Hvert skritt er designet for å gi et konkret testbart resultat.",
        "",
    ]
    Path(path).write_text("\n".join(header) + "\n\n".join(plans) + "\n", encoding="utf-8")


def build_sales_angle(concept):
    name = concept["name"]
    customer = concept["customer"]
    problem = concept["problem"]
    solution = concept["solution"]
    cost = _fmt_nok(concept["estimated_cost"])
    rev = _fmt_nok(concept.get("est_annual_revenue_nok", 0))
    problem_short = problem if len(problem) <= 70 else problem[:67].rsplit(" ", 1)[0] + "..."
    problem_clause = problem.rstrip(".")

    return f"""## {name}

**Pitch (30 sekunder):** «{customer}» taper penger og tid fordi «{problem_clause}» oppdages for sent.
{name} løser det ved at {solution.rstrip('.')}. En fungerende pilot kan testes på en konkret lokasjon innen 14 dager.

**E-post-emne:** Vil du teste en løsning på «{problem_short}» før neste sesong?

**Telefonåpning:** «Hei, jeg bygger {name} — en løsning som varsler {customer} _før_ dette problemet blir dyrt.
Har du 10 minutter denne uken til en kort gjennomgang?»

**Tallene bak:** Prototypekostnad {cost} NOK · Estimert år 1-omsetning {rev} NOK.

**Hvorfor dette ikke er bullshit:** {name} har en definert testprotokoll, en konkret 14-dagers byggeplan
og en fast prototypekostnad — ikke et konsept på et lysbilde. Demo kan vises innen 2 uker fra «ja».
"""


def render_sales_angles(angles, path):
    header = [
        "# Salgsvinkler — Sivil Feltlab",
        "",
        "Klare salgspitcher, e-postemner og telefonåpninger per konsept.",
        "Basert på faktisk prototypekostnad og markedsestimater.",
        "",
    ]
    Path(path).write_text("\n".join(header) + "\n\n".join(angles) + "\n", encoding="utf-8")


def render_roi_simulation(sim_results, path):
    lines = [
        "# ROI-simulering — Monte Carlo (10 000 iterasjoner per konsept)",
        "",
        "**Metodikk:** Triangulær sannsynlighetsfordeling på markedsstørrelse, adopsjon, pris",
        "og prototypekostnad. P10 = pessimistisk utfall, P50 = medianscenariet, P90 = optimistisk.",
        "Tilbakebetalingssannsynlighet = andel simuleringer med positivt netto år 1.",
        "",
        "| Konsept | Score | Est. kostnad | Sim. P10 netto | Sim. P50 netto | Sim. P90 netto | Sannsynlighet BE |",
        "|---|---|---|---|---|---|---|",
    ]
    for r in sim_results:
        lines.append(
            f"| {r['name']} | {r['value_score']} "
            f"| {_fmt_nok(r['estimated_cost_nok'])} NOK "
            f"| {_fmt_nok(r['sim_p10_net_nok'])} NOK "
            f"| {_fmt_nok(r['sim_p50_net_nok'])} NOK "
            f"| {_fmt_nok(r['sim_p90_net_nok'])} NOK "
            f"| {r['breakeven_prob']}% |"
        )

    lines += [
        "",
        "## Tolkning",
        "",
        "- **P50 > 0** = medianscenariet er lønnsomt — gå videre.",
        "- **P10 > −50 000** = selv et dårlig utfall er håndterbart.",
        "- **Breakeven-sannsynlighet > 60%** = statistisk sett en god bet.",
        "",
        "_Disse tallene er modellbaserte estimater, ikke garantier. Bruk dem til prioritering, ikke business-plan._",
    ]

    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def render_segment_analysis(scored, segments, path):
    lines = [
        "# Segmentanalyse — Sivil Feltlab",
        "",
        "Matching mellom konsepter og kundesegmenter med salgskanal og beslutningstaker.",
        "",
    ]
    for c in scored:
        seg_id = _match_segment(c["customer"], segments)
        seg = segments.get(seg_id, {})
        lines += [
            f"## {c['name']}",
            f"- **Score:** {c['value_score']}",
            f"- **Kundegruppe:** {c['customer']}",
        ]
        if seg:
            lines += [
                f"- **Beslutningstaker:** {seg.get('decision_maker', '—')}",
                f"- **Typisk budsjett:** {seg.get('typical_budget_nok', '—')} NOK",
                f"- **Salgssyklus:** ca. {seg.get('sales_cycle_days', '—')} dager",
                f"- **Beste kanal:** {seg.get('best_channel', '—')}",
            ]
        else:
            lines.append("- _Ingen segmentmatch funnet — vurder manuell tilpasning._")
        lines.append("")

    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def _match_segment(customer_text, segments):
    customer_lower = customer_text.lower()
    for seg_id, seg in segments.items():
        label_lower = seg.get("label", "").lower()
        if any(word in customer_lower for word in label_lower.split("/")):
            return seg_id
    return None
