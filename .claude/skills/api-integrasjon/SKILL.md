---
name: api-integrasjon
description: Koble prosjekter til eksterne API-er (musikk, bilde, video, data) på en trygg måte — nøkkelhåndtering, feilhåndtering og kvoter.
---

# API-integrasjon

## Fremgangsmåte
1. **Les API-dokumentasjonen først** (WebFetch). Finn: autentisering, rate limits, priser, eksempelkall.
2. **Test med curl** før du skriver kode — bekreft at nøkkel og endepunkt virker.
3. **Nøkler**: ALLTID i `.env` (som står i `.gitignore`), leses via miljøvariabler. Aldri i kode, aldri i commits, aldri i logger.
4. **Robust klient**:
   - Timeout på alle kall (10–30 s)
   - Retry med eksponentiell backoff på 429/5xx (2s, 4s, 8s)
   - Tydelig feilmelding når nøkkel mangler: «Sett MILJØVARIABEL_X i .env»
5. **Kvotebevissthet**: Logg antall kall. Ved batch-jobber (100 bilder!), sjekk pris per kall og estimer totalkost FØR du kjører, og rapporter estimatet til brukeren.

## Regler
- Aldri kjør en batch mot et betalt API uten eksplisitt klarsignal fra brukeren.
- Cache svar lokalt under utvikling så du ikke betaler for samme kall to ganger.
