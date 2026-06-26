"""Generate concrete 14-day prototype plans, tailored by concept domain."""

DOMAIN_COMPONENTS = {
    "havn": ["sonar-modul", "undervannskamera", "ROV-ramme", "tjorekabel og topside-strømforsyning"],
    "rov": ["thrustere x4-6", "trykktett kapsling", "tjorekabel med topside-kontrollboks", "LED-lyssett"],
    "drone": ["flight controller (open-source)", "RGB/IR-kamera", "GPS/RTK-modul", "telemetrilink"],
    "oppdrett": ["IMU/akselerometer", "vanntett not-klype", "LoRaWAN/4G-modul", "korrosjonsbestandig kapsling (titan/POM)"],
    "is": ["temperatur- og fuktsensor (SHT31)", "LED-varsellampe", "lavtemperatur-batteri", "værbestandig kapsling"],
    "snø": ["temperatur- og fuktsensor (SHT31)", "LED-varsellampe", "lavtemperatur-batteri", "værbestandig kapsling"],
    "vann": ["hydrofon/akustisk sensor", "LoRaWAN-modul", "vanntett kapsling IP68", "batteripakke 3.7V Li-ion"],
    "kommunal infrastruktur": ["akustisk klemmesensor", "LoRaWAN gateway", "sky-dashboard", "monteringsklemme i rustfritt stål"],
    "hytte": ["temperatur- og trykksensor", "SMS/4G-modul", "batteri med 2 års standby", "magnetfeste"],
    "anbud": ["web-scraper mot offentlig anbudsdatabase", "filtreringsmotor", "e-postvarslingsmodul", "dashboard"],
    "byggesak": ["matrikkel-API-integrasjon", "PDF-generator", "sporingslogg", "varslingsmodul"],
    "ai-agentverktøy": ["lokal LLM-pipeline", "malbibliotek", "menneske-i-loop review-steg", "eksportmodul"],
    "patent": ["patentdatabase-API (Espacenet)", "nøkkelordklynging", "white-space-visualisering", "rapportgenerator"],
    "offentlig systemrot": ["fakturaparser (OCR)", "forskriftsdatabase", "avviksmotor", "klagebrev-generator"],
    "kulde": ["peltier-modul", "liten blåser/fan", "temperatursensor", "kompakt kapsling"],
}

GENERIC_COMPONENTS = [
    "mikrokontroller (ESP32)",
    "domenerelevant sensor",
    "trådløs kommunikasjonsmodul (LoRa/4G)",
    "enkel værbestandig kapsling",
]


def _components_for(domain):
    domain_lower = domain.lower()
    for key, components in DOMAIN_COMPONENTS.items():
        if key in domain_lower:
            return components
    return GENERIC_COMPONENTS


def build_plan(concept):
    components = _components_for(concept["domain"])
    name = concept["name"]
    customer = concept["customer"]
    problem = concept["problem"]

    return f"""## {name} - 14-dagers prototypeplan

**Domene:** {concept['domain']}
**Kunde:** {customer}
**Problem:** {problem}

- **Dag 1-2 (Research):** Kartlegg 3 konkrete tilfeller hos "{customer}" der dette problemet har inntruffet siste 12 måneder. Samle tallverdier: kostnad per hendelse, frekvens, og hva de bruker i dag.
- **Dag 3-4 (Komponentvalg):** Bestill og test: {", ".join(components)}.
- **Dag 5-7 (Første mockup):** Bygg fungerende breadboard-versjon av {name}. Suksesskriterium: enheten registrerer eller varsler korrekt på ett kontrollert testpunkt.
- **Dag 8-10 (Test):** Kjør felttest på en reell eller realistisk simulert lokasjon for "{customer}" (se data/test_protocols.yaml for domenespesifikk protokoll). Logg falske positiver og negativer.
- **Dag 11-12 (Forbedring):** Fiks de to største svakhetene fra testloggen. Mål: redusere falsk-varsling til under 10%.
- **Dag 13 (Pitch):** Lag en 1-sides pitch og en kort demo-video av {name} rettet mot "{customer}".
- **Dag 14 (Kundeutsendelse):** Send pitch og møteforespørsel til minst 3 navngitte kontakter i segmentet "{customer}".

**Estimert prototypekostnad:** {concept['estimated_cost']} NOK
"""
