# ROI-analyse – Verde Kolibri (regnearkoppsett)

Klar til å limes inn i Excel/Numbers/Google Sheets. Tall er konservative anslag
for et solopreneur-oppstartsløp i Vestland – juster de gule (markert ⚠️) først.

## Ark 1: Kostnader (år 1)

| Post | NOK | Kommentar |
|---|---:|---|
| Prototype-ramme + motorer + FC | 35 000 | ⚠️ Basert på åpen hardware (Pixhawk-klasse) |
| Riblet-folie + panelmateriale | 8 000 | Testfolie, CNC/3D-print av paneler |
| Tynnfilm-solceller | 6 000 | |
| Batterier + lader (felt) | 9 000 | |
| Sensorer/kamera (inspeksjon) | 25 000 | ⚠️ Termisk kamera er største enkeltpost |
| Patentstyret, norsk søknad | 4 800 | Liten aktør-avgift |
| Forsikring + RO2/RO3-operatørgodkjenning | 15 000 | Luftfartstilsynet |
| Diverse/buffer 15 % | 15 000 | |
| **Sum investering** | **117 800** | |

## Ark 2: Inntekt per oppdrag

| Tjeneste | Pris/oppdrag (NOK) | Kost/oppdrag | Margin |
|---|---:|---:|---:|
| Tipp-/deponiinspeksjon (gruve) | 18 000 | 3 500 | 14 500 |
| Kraftlinje-segment | 12 000 | 2 500 | 9 500 |
| Naturovervåking (offentlig) | 9 000 | 2 000 | 7 000 |

Referansepunkt: helikopterinspeksjon koster kunden typisk 40–80 000 NOK/dag.
Vi kan prise 50–70 % under helikopter og fortsatt ha >75 % bruttomargin.

## Ark 3: Break-even

| Scenario | Oppdrag/mnd | Snittmargin | Mnd til break-even |
|---|---:|---:|---:|
| Pessimist | 2 | 9 000 | ~7 |
| Basis | 4 | 10 500 | ~3 |
| Optimist | 8 | 11 500 | ~1,5 |

Formel til regnearket: `=Investering / (Oppdrag_per_mnd * Snittmargin)`

## Ark 4: Verde-premien (bruk i salg)

- Kundens ESG-rapport: 0 kg CO₂ per inspeksjon vs. ~200 kg med helikopter.
- +13 % oppdragssuksess i dårlig vær (fra simuleringen) = færre bomturer å fakturere bort.
- Lavt støynivå (kongsfisker-profil) → tillatelser i verneområder der helikopter nektes.

## Neste steg for xlsx

Kjør xlsx-skill / lag fil med de fire arkene over, legg inn `SCENARIO`-dropdown
(pessimist/basis/optimist) og et break-even-diagram. Del som PDF i pitch.
