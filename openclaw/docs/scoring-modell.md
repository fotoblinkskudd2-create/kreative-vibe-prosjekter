# Scoringsmodellen

Fem akser, 0–10 hver, vektet til én totalscore. Vektene ligger i
`openclaw/config/regnviking-30h.json` og kan justeres uten kodeendring.

| Akse | Vekt | Spørsmålet du faktisk stiller | 0 | 10 |
|---|---|---|---|---|
| `brukbarhet_48h` | 0.30 | Kan en **fungerende** v0 stå ferdig innen 48 timer med det du har i dag? | Krever innkjøp, ventetid eller folk | Du kan starte nå og være ferdig i morgen kveld |
| `robusthet` | 0.15 | Holder den uten daglig babysitting? | Kollapser hvis du er borte en uke | Kjører videre av seg selv |
| `selgbarhet` | 0.30 | Finnes det en identifiserbar kjøper med budsjett og smerte i dag? | Ingen vet at de trenger det | Du kan navngi ti kjøpere denne uka |
| `patent_potensial` | 0.15 | Er det en teknisk effekt som er ny, ikke-åpenbar og beskrivbar i krav? | Ren kombinasjon av kjent teknikk | Målbar effekt ingen har beskrevet |
| `energi_kost` | 0.10 | **Invertert.** Hva koster den deg å bære? | Tapper deg helt | Nesten gratis |

## Dommer

| Total | Dom | Hva det betyr |
|---|---|---|
| ≥ 7.5 | **BYGG NÅ** | Går rett inn i fase 3 samme syklus. |
| 5.0 – 7.4 | **PARKER + NOTER** | Skriv én linje: hva må endre seg for at denne skal leve? |
| < 5.0 | **DREP** | Skriv dødsårsaken. Den er arkivverdien. Ideen slettes aldri. |

## Hvorfor disse vektene

`brukbarhet_48h` og `selgbarhet` har 0.30 hver fordi de er de to eneste aksene som er
falsifiserbare innen en uke. Robusthet og patent er spådommer; 48h og kjøper er tester.
En solopreneur som vekter spådommer like tungt som tester bygger et arkiv, ikke et firma.

`energi_kost` har lav vekt (0.10) men er med fordi en idé som scorer 9 på alt annet og 1
her, kommer til å ligge halvferdig. Den fanger ikke opp mye, men den fanger opp det som
ellers ville drept syklus 12.

## Bruk

```bash
python3 openclaw/runner/openclaw.py score openclaw/runner/ideer.eksempel.json
```

Input-format:

```json
{
  "ideer": [
    {
      "navn": "Kort navn",
      "verdier": {
        "brukbarhet_48h": 9, "robusthet": 8, "selgbarhet": 7,
        "patent_potensial": 7, "energi_kost": 8
      },
      "begrunnelse": "Én til to setninger. Nevn kjøperen ved navn."
    }
  ]
}
```

Ukjente akse-navn og verdier utenfor 0–10 gir feilmelding — det er meningen. En score
skrevet med skrivefeil er verre enn ingen score, fordi den ser riktig ut i tabellen.

## Kalibreringsregler

1. **Score før du liker.** Hvis du scorer etter at du har bestemt deg, scorer du bakover fra svaret.
2. **Ingen 10-ere på selgbarhet uten navn.** Kan du ikke navngi kjøperen, er taket 6.
3. **48h måles i din verste uke, ikke din beste.** Estimat basert på en perfekt lørdag er ikke et estimat.
4. **Patent ≥ 7 utløser patentnotat samme syklus.** Ikke senere. Senere blir aldri.
