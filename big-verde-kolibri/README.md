# 🌿 Big Verde – Verde Kolibri Drone

**Naturinspirert drone for bærekraftig inspeksjon i Vestland/Arktis.**
Kolibri-agilitet + haiskinn-overflate + solcelledrift = lav-impact overvåking av gruver, kraftlinjer og natur — der regnet aldri gir seg og isen aldri sover.

> *"Regn i Bergen, men sola i panel, shark skin drone flyr over dal..."*

## Konseptet (30 sekunder)

| Biomimicry-kilde | Teknisk løsning | Verde-gevinst |
|---|---|---|
| 🐦 Kolibri | Vingekinematikk-inspirert rotorprofil, hover i vindkast opp mot 12 m/s | Inspeksjon uten landing = null terrengslitasje |
| 🦈 Haiskinn (riblets) | Mikroriflet dronekropp, ~6-8 % mindre luftmotstand | Lengre flytid per Wh |
| 🐟 Kongsfisker (kingfisher) | Nese-/kroppsprofil for lav turbulens | Stillere = mindre forstyrrelse av dyreliv |
| 🦎 Pangolin | Overlappende skallpaneler | Anti-icing: is flaker av ved fleksing i stedet for varmekabler |
| ☀️ Fotosyntese-logikk | Solcellefilm på oversiden, lader i hover-pauser | Off-grid drift i felt, null dieselaggregat |

## Målmarked

1. **Gruveinspeksjon Vestland/Arktis** – tipper, dagbrudd, deponi. Dagens løsning: helikopter eller manuell klatring.
2. **Kraft/infrastruktur** – linjer og master i vær der vanlige droner ikke tør fly.
3. **Naturovervåking** – reinsdyrtelling, skredfare, breovervåking. Lav-impact er selve salgsargumentet.

## Mappestruktur

```
big-verde-kolibri/
├── README.md              ← du er her
├── sim/
│   └── verde_kolibri_sim.py   Monte Carlo energi- og oppdragssimulering (kjørbar!)
├── dashboard/
│   └── VerdeKolibriDashboard.swift   SwiftUI iOS-dashboard (mission control)
├── docs/
│   ├── patent-skisse.md       Patentutkast: pangolin anti-icing + riblet-integrasjon
│   ├── grant-keywords.md      Søknadsnøkkelord: Innovasjon Norge, Forskningsrådet, Horizon Europe
│   └── roi-analyse.md         ROI-regneark-oppsett (klar for xlsx)
├── visuals/
│   └── midjourney-prompts.md  Visuelle prompts for pitch og sosialt innhold
└── musikk/
    └── big-verde-kolibri-rise.md   Suno-prompt: "Big Verde – Kolibri Rise"
```

## Kjør simuleringen nå

```bash
python3 sim/verde_kolibri_sim.py
```

Ingen avhengigheter utover standardbiblioteket. Simulerer 10 000 inspeksjonsoppdrag i Vestland-vær (regn, vind, ising, lite sol) og sammenligner Verde Kolibri mot en standard inspeksjonsdrone: flytid, oppdragssuksess, energiforbruk.

## Neste 3 steg (48h-planen)

1. **I dag:** Kjør simen, juster parametre mot reelle dronespesifikasjoner (DJI M350 som baseline). Lag ROI-xlsx fra `docs/roi-analyse.md`.
2. **I morgen:** Generer Midjourney-visuals (`visuals/midjourney-prompts.md`), sett sammen 1-siders pitch. Send grant-keywords inn i Innovasjon Norge-skjemaet (utkast, ikke innsending).
3. **Dag 2:** Suno-tune fra `musikk/`-mappa + 60-sekunders motivasjonsvideo. Gonzo-manifestet inn i Min Minibibel.

## PanicSafe-twist (mental health i felt)

Feltarbeid i arktisk vær er ensomt og hardt. Dashboardet har en innebygd **PanicSafe-modus**: pusteøvelse + automatisk "return to home" med ett trykk, slik at operatøren aldri må velge mellom egen helse og utstyret. Dette er differensiatoren ingen dronekonkurrent har.

---
*Big Verde! Empire grønt og rått, OpenClaw våkner, vi bygger i natt!* 🚀🌿
