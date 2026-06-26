# Civilian Use Policy

Dette prosjektet bygger og rangerer kun **sivile, lovlige** produktkonsepter
innen vann, kommunal infrastruktur, oppdrett, havn, is/kulde, ROV/sivil drone,
byggesak, anbud og AI-agentverktøy for dokumentbehandling.

## Absolutte grenser (håndhevet automatisk av `src/risk_filter.py`)

Et konsept blir **automatisk blokkert** fra alle rapporter hvis navn, domene,
problem- eller løsningstekst inneholder treff på en av disse kategoriene
(full liste med nøkkelord i `data/risk_rules.yaml`):

1. **Våpen** - alt som er eller inneholder et våpensystem.
2. **Skjult overvåkning** - skjulte kameraer, spionasje-funksjon.
3. **Personsporing** - sporing av enkeltpersoner uten deres kjennskap.
4. **Jamming** - forstyrrelse av radio-/GPS-signaler.
5. **Militær taktikk** - stridsteknikk eller krigføringsdoktrine.
6. **Skadefunksjon** - funksjoner laget for å skade utstyr, infrastruktur
   eller personer.
7. **Autonom angrepsevne** - selvstyrte systemer som kan angripe et mål.

## Hva som er greit

Konsepter som overvåker **fysisk infrastruktur** (rør, not, brygge, vei,
bygg, dokumenter) for å forebygge skade, kostnad eller risiko for
mennesker/miljø, er innenfor scope. Dette inkluderer:

- Lekkasje- og slitasjedeteksjon på rør, nøter og konstruksjoner.
- Strukturell overvåkning (snølast, is, korrosjon, begroing).
- Sivile ROV/drone-inspeksjoner av infrastruktur (ikke personer).
- Automatisering av offentlig dokumentasjon (anbud, nabovarsel, gebyrer)
  basert på offentlig tilgjengelig informasjon.

## Eierskap til avgjørelsen

`risk_filter.py` er en teknisk sikkerhetsmekanisme, ikke en erstatning for
manuell vurdering. Ethvert nytt konsept skal også leses manuelt mot denne
policyen før det legges inn i `data/concepts.yaml`.
