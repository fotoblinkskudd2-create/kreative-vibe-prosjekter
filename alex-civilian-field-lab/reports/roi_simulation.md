# ROI-simulering — Monte Carlo (10 000 iterasjoner per konsept)

**Metodikk:** Triangulær sannsynlighetsfordeling på markedsstørrelse, adopsjon, pris
og prototypekostnad. P10 = pessimistisk utfall, P50 = medianscenariet, P90 = optimistisk.
Tilbakebetalingssannsynlighet = andel simuleringer med positivt netto år 1.

| Konsept | Score | Est. kostnad | Sim. P10 netto | Sim. P50 netto | Sim. P90 netto | Sannsynlighet BE |
|---|---|---|---|---|---|---|
| SmoltGuard Nett | 8.1 | 28 000 NOK | 32 547 891 NOK | 70 610 527 NOK | 124 431 143 NOK | 100.0% |
| MerdStress Listener | 8.1 | 18 000 NOK | 8 305 046 NOK | 18 238 915 NOK | 32 491 704 NOK | 100.0% |
| CabinWater Guard | 8.1 | 3 500 NOK | 2 978 210 NOK | 6 204 140 NOK | 10 506 452 NOK | 100.0% |
| LeakPulse Tile | 7.6 | 4 500 NOK | 1 544 440 NOK | 3 262 563 NOK | 5 536 109 NOK | 100.0% |
| KommuneKlage AI | 7.8 | 800 NOK | 275 383 NOK | 575 195 NOK | 985 245 NOK | 100.0% |

## Tolkning

- **P50 > 0** = medianscenariet er lønnsomt — gå videre.
- **P10 > −50 000** = selv et dårlig utfall er håndterbart.
- **Breakeven-sannsynlighet > 60%** = statistisk sett en god bet.

_Disse tallene er modellbaserte estimater, ikke garantier. Bruk dem til prioritering, ikke business-plan._
