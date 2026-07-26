# Riblet-Kalkulator

Regner optimal haihud-rillegeometri (riblets) for droneskrog og vinger ut fra flyfart,
posisjon på overflaten og luftforhold — og sier hva som faktisk kan produseres med det
utstyret du har.

## Bruk

**Web:** åpne `index.html` i en nettleser. Ingen server, ingen avhengigheter, fungerer offline.

**CLI:**
```bash
python3 riblet.py --fart 20 --posisjon 0.5 --temp 15 --hoyde 0
python3 riblet.py --test          # 10 enhetstester
```

## Eksempel

```
Fart 20 m/s ved 500 mm fra forkant
  Re_x      : 6.846e+05
  TURBULENT — riblets virker i dette området.
  δ_ν       : 16.27 µm

  RILLEAVSTAND s : 260.3 µm  (0.260 mm)
  RILLEHØYDE   h : 130.2 µm  (0.130 mm)
  Estimert DR    : +8.0 %  (empirisk — mål selv)

  Produksjon: SLA/DLP eller mikrofresing. FDM er utelukket.
```

## Fysikken

| Steg | Formel | Kilde |
|---|---|---|
| Trykk (ISA) | p = 101325·(1 − 2.25577e−5·h)^5.2559 | ISA-standardatmosfære |
| Dynamisk viskositet | μ = 1.458e−6·T^1.5/(T + 110.4) | Sutherland |
| Tetthet | ρ = p/(R·T), R = 287.05 | Idealgass |
| Reynolds | Re_x = U·x/ν | — |
| Lokal friksjon | C_f = 0.0592·Re_x^(−1/5) | Prandtl, flat plate, gyldig 5e5 < Re_x < 1e7 |
| Veggskjær | τ_w = ½·ρ·U²·C_f | — |
| Friksjonshastighet | u_τ = √(τ_w/ρ) | — |
| Viskøs lengde | δ_ν = ν/u_τ | — |
| **Rilleavstand** | **s = s⁺·δ_ν**, s⁺ = 15–20 | Bechert et al., trekantriller |
| Rillehøyde | h ≈ 0.5·s | Bechert et al. |

## Hva du kan stole på, og hva du ikke kan

**Stol på:** geometrien. s og h følger av standard grensesjiktteori og etablerte s⁺-verdier.
Python- og JS-implementasjonene gir identiske tall, verifisert mot håndregning.

**Ikke stol på:** DR-prosenten. Den er en empirisk kurveform — topp ~8 % ved s⁺ ≈ 16, null
ved s⁺ ≈ 32, motstandsøkning over det. Formen er hentet fra publiserte målinger; det absolutte
tallet er ikke kalibrert for lave Reynolds-tall, som er nettopp regimet droner flyr i. Bruk
kurven til å velge s⁺, aldri til å love en kunde en prosent.

**Merk særlig:** ved Re_x < 5·10⁵ er grensesjiktet laminært, og riller gjør **skade**, ikke
nytte. Ved 20 m/s ligger overgangen rundt 0.37 m bak forkanten. Verktøyet flagger dette rødt.

## Neste fysiske handling

Print to paneler à 150 × 300 mm — ett glatt, ett rillet — og mål. Full protokoll står nederst
i `index.html`. Logg i `maalinger.csv`. Uten den målingen er alt over teori.

## Relatert

- Patentnotat: `../patent/patentnotat-001-riblet.md` (les seksjon 8 om publiseringssperre
  **før** du deler noe om posisjonsavhengig påføring)
- Scoring: 7.70 → BYGG NÅ, se `../ide-jakt/idebank-scoret.md`
