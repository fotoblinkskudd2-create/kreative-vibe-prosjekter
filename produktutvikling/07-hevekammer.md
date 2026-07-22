# 7. HEVEKAMMER
## Fermenteringskammer som måler heving, ikke tid
### Sider 21–23

---

## SIDE 21 — IDÉ OG DESIGN

### Kilde
Surdeig, i årevis. Og observasjonen enhver seriøs hjemmebaker gjør til
slutt: alle verktøyene måler feil variabel. Foldeklokker, temperatur-
apper, «rubaud i 4 minutter» — alt er proxy for det ene som betyr noe:
*hvor langt fermenteringen faktisk er kommet*. Deigen bryr seg ikke om
klokka. Den produserer CO₂ i en rate som forteller nøyaktig hvor den er
i løpet, og ingen på kjøkkenmarkedet måler den.

### Problem
Hjemmebakere og mikrobakerier ødelegger deiger på timing — overheving er
uopprettelig — fordi fermenteringshastighet varierer 3–4× med temperatur,
mel og kultur, mens alle oppskrifter og alle produkter angir *tid*.

### Produkt
Et isolert benkekammer (40 L) med presis temperaturstyring 4–32 °C
(varme *og* kjøling) som måler CO₂-produksjonsrate i sanntid og varsler
på *fermenteringstilstand*: «40 % igjen», «sett i ovnen om 35 min»,
«sett kaldt nå hvis du vil bake i morgen».

### Design
- **Kabinett:** 30 mm EPP-isolasjon, glassdør, 40 L — to banneton eller
  én bulk-boks. Benkevennlig fotavtrykk.
- **Termikk:** 15 W varmefolie + peltier-kjøling. Kjøling er ikke luksus:
  retard ved 4 °C er halve surdeigsmetodikken, og intet konkurrerende
  «proofer» på markedet kjøler (side 22 for effektbudsjett).
- **[ORIGINAL] CO₂-rate som primærsensor:** NDIR CO₂-sensor i kammeret.
  Ikke nivået — *deriverten*. CO₂-produksjonsraten per gram deig følger
  gjærpopulasjonens aktivitetskurve; vendepunktet i raten kommer 30–45
  minutter før overheving (side 22). Kombinert med deigtemperatur (IR,
  berøringsfritt) gir det en tilstandsestimator, ikke en timer.
  Brød & Taylor og Sourhouse selger termostater. HEVEKAMMER selger
  svaret på det eneste spørsmålet bakeren faktisk har: *når*.
- **Grensesnitt:** e-ink-panel + app (lokal API — dette er et verktøy,
  ikke en skytjeneste; fungerer uten internett for alltid).
- **Matkontakt:** kammerflater i rustfritt/glass, EPP utenfor dampsonen.

---

## SIDE 22 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 7.

### Termisk budsjett
UA-verdi (30 mm EPP, 0,85 m² flate): **0,99 W/K.**

| Modus | Behov | Løsning |
|---|---|---|
| Holde 26 °C i 18 °C rom | 7,9 W | 15 W folie, god margin |
| Retard 4 °C i 18 °C rom | 14 W kjøleeffekt | Peltier COP 0,45 → 31 W elektrisk |

31 W kontinuerlig i retard-modus er ~0,75 kWh/døgn — 80 øre. Peltier er
ineffektiv fysikk, men ved 14 W varmelast er ineffektiv fysikk billig, og
den er lydløs og vibrasjonsfri, uten kompressor. Riktig valg i denne
størrelsen, feil i alle større. Kammervolumet er derfor låst til 40 L —
ikke fordi markedet vil ha det, men fordi fysikken slutter å samarbeide
over det.

### CO₂-signalet
800 g deig ved aktivitetstopp: ~1,2 mL CO₂/g/time → **~457 ppm/min**
stigning i 35 L fritt kammervolum. En NDIR-sensor med ±30 ppm støy ser
den raten med SNR i hundreklassen ved ett minutts midling. Vendepunktet i
ratekurven (andrederiverten skifter fortegn når gjæren passerer substrat-
toppen) detekteres robust 30–45 min før den visuelle «poke test»-grensen.
Det er varselet som redder deigen. Kalibrering per deigmasse gjøres
automatisk: brukeren angir melvekt, resten er regresjon.

### Det simuleringen ikke fanger
CO₂-stratifisering i kammeret (mitigeres med mikrovifte, 0,1 W),
lokkåpninger som nuller sensorbaseline (detekteres som steg-artefakt og
maskeres i programvare), kondens på elektronikk ved retard (konformal
coating, drenert bunn), og biologisk variasjon mellom kulturer — som ikke
er støy, men selve grunnen til at produktet må finnes: variasjonen er
argumentet mot timer-paradigmet.

### Verifikasjon i prototyp
Pass/fail: over 20 kontrollbak med tre ulike kulturer skal kammeret
predikere «optimal ovntid» innenfor ±20 min mot blind fagvurdering
(krummestruktur-scoring) i minst 16 av 20. Klarer den ikke det, er den
en dyr termostat, og dommen ryker.

---

## SIDE 23 — MARKED OG PROTOTYP

### Marked
Surdeigsmarkedet er stort, globalt og betalingsvillig: Brød & Taylor
folding proofer (~2 500 NOK, kun varme, ingen sensor) er hyllevare i
hver seriøse hjemmebakers kjøkken; Sourhouse Goldie (kun starter-varme)
ble Kickstarter-suksess på et *langt* svakere verdiforslag. Segmentet
demonstrerer kjøpekraft årlig.

Målgrupper: (1) entusiast-hjemmebakere — globalt, engelskspråklig,
community-drevet marked som kjøper på YouTube-demonstrasjoner; (2)
mikrobakerier (REKO-ringer, hjemmesalg — flere tusen i Norden), der én
ødelagt bulk er 1 000+ NOK i tapt salg og prediksjon er penger direkte.

Pris: **3 990 NOK.** BOM-mål i produksjon: 1 100 NOK. Kanal: Kickstarter
først — kategorien har bevist at den finansierer der, og kampanjen er
samtidig markedsvalidering med ekte penger som innsats. Norsk melbransje
(Holli mølle-klassen) som samarbeidspartnere for innhold.

Konkurransetrussel: lav teknisk vollgrav på termostat-delen — hvem som
helst kan varme en boks. Vollgraven er tilstandsestimatoren og datasettet
av bak-kurver, som vokser med hver bruker (opt-in deling, lokalt først).

### Prototyp
| Post | NOK |
|---|---|
| Kabinett (EPP-plater, glassdør, ramme) | 1 900 |
| Peltier-modul, kjøleribber, vifter, varmefolie | 1 400 |
| NDIR CO₂-sensor (SCD41-klasse) + IR-deigtermometer | 800 |
| ESP32, e-ink, strømforsyning | 700 |
| Diverse, tetting, matkontakt-flater | 900 |
| **Sum** | **5 700** |

Byggetid 4 uker til fungerende kammer, deretter 6 uker kontrollbak-
protokoll (20 bak à 2–3 per uke — kalenderen styres av deigen, som seg
hør og bør). Billigste og minst risikable prototyp i porteføljen, og
den eneste jeg kan verifisere fullstendig på eget kjøkken.

### Dom
**BYGG — som første produkt av alle.** Ikke fordi det er størst, men
fordi det er raskest til komplett løkke: bygget, verifisert, filmet og
Kickstarter-klart på 10 uker, finansiert av kjøkkenbenken. Momentum er
også en ressurs.
