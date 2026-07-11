---
name: datainnsamling
description: Samle data fra nettet på lovlig og høflig vis — API-er først, deretter forsiktig scraping med respekt for robots.txt og vilkår.
---

# Datainnsamling

## Prioritert rekkefølge
1. **Offisielt API** — finnes nesten alltid, sjekk først.
2. **Datasett som allerede finnes** (data.norge.no, Kaggle, HuggingFace, Wikipedia-dumps).
3. **RSS/sitemaps** — strukturert og ment for maskiner.
4. **Scraping** — kun som siste utvei, og da:
   - Sjekk robots.txt og vilkår først; respekter dem.
   - Maks 1 forespørsel per 2 sekunder, identifiserende User-Agent.
   - Hent bare det du trenger, aldri hele nettsteder.

## Regler
- Aldri omgå innlogging, betalingsmurer eller tekniske sperrer.
- Persondata samles ikke inn. Punktum.
- Lagre rådata i `herden/data/<kilde>/` med en `KILDE.md` som sier hvor, når og hvordan det ble hentet.
- Data til kreative prosjekter (tekstkorpus til sanger o.l.): sjekk lisens før bruk.
