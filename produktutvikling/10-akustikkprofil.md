# 10. AKUSTIKKPROFIL
## Mekanisk adaptiv absorbent for små rom
### Sider 30–32

---

## SIDE 30 — IDÉ OG DESIGN

### Kilde
Hjemmestudioet. Alle som mikser i et vanlig rom kjenner dilemmaet:
bassproblemene krever tykke, dype absorbenter; mellomtone/flutter krever
noe helt annet; og rommet er også en stue. Markedet svarer med å selge
deg *flere paneler* — ett produkt per problem, til veggen er full.
Ingeniørsvaret er åpenbart: ett panel som kan *endre* sin akustiske
virkning. Det finnes i konserthus-skala (variabel akustikk, motorisert,
hundretusener). Det finnes ikke på hjemmestudio-budsjett.

### Problem
Små lytterom (hjemmestudio, podkast, teams-rom) trenger ulik akustisk
behandling for ulik bruk — sporing, miks, tale, sosialt rom — men
absorbenter er statiske, så alle kjøper enten for mye, feil, eller begge.

### Produkt
Et veggpanel (60 × 48 cm, 14 cm dypt) med mekanisk omstillbar akustikk:
en håndbetjent spjeldmekanisme endrer panelet mellom bredbåndsabsorbent,
basstunet resonansabsorbent og reflektor/diffusor — uten verktøy, uten
strøm, med et vribart hjørnegrep.

### Design
- **Tre tilstander, én mekanikk:**
  1. **Åpen:** perforert front eksponerer porøs kjerne — bredbånds-
     absorpsjon fra ~250 Hz og opp.
  2. **Lukket:** frontplaten tetter perforeringen og blir membran mot
     luftvolumet bak — panelet blir membranabsorbent tunet til
     80–140 Hz-området (dybde og massebelegg setter senterfrekvens).
  3. **Reflektor:** indre spjeld låser membranen stiv — panelet blir
     hardt og bevarer rommets liv, for opptak som trenger luft.
- **[ORIGINAL] Måling styrer stillingen:** medfølgende app (telefon-
  mikrofon, sweep-metode, kalibreringsprofil per telefonmodell) måler
  RT60 og modale problemer, og sier bokstavelig talt: «panel 1–4 lukket,
  5–8 åpne». Akustikkbransjen selger enten produkter *eller* konsulent-
  målinger; her er målingen innebygd i produktet og styrer en mekanisk
  frihetsgrad panelene faktisk har. Statisk-panel-produsentene kan ikke
  kopiere sløyfen uten å redesigne produktet sitt.
- **Materiale:** gjenvunnet tekstilfiber-kjerne (norsk produsent finnes),
  eik/ask-ramme — det skal tåle å henge i en stue. Estetikk er ikke
  pynt her; det er adgangsbilletten til rommene produktet skal henge i.

---

## SIDE 31 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 10.

### Referanserom (typisk hjemmestudio: 4,0 × 3,5 × 2,4 m)
Volum 34 m³, totalflate 64 m², Sabine:

| Konfigurasjon | Midlere α | RT60 |
|---|---|---|
| Ubehandlet (gips, parkett, vinduer) | 0,09 | 0,94 s |
| 8 paneler i lukket modus (bassfokus) | 0,16 | 0,53 s |
| 8 paneler i åpen modus (bredbånd) | 0,27 | 0,31 s |

Mål for kritisk lytting i småroms-standarder (EBU 3276-klassen): ~0,3 s
±20 % i mellomband. **Åtte paneler à 0,29 m² når målet.** Samme åtte
paneler i lukket modus flytter absorpsjonen ned dit modene bor — Sabine
fanger ikke modal demping direkte (den er ikke diffus-felt-fysikk), men
membranabsorbentens virkningsområde 80–140 Hz treffer aksialmodene i
rom av denne størrelsen (første aksialmoder 43/49/71 Hz, tangentiale og
førsteordens over 85 Hz). De laveste modene under 80 Hz krever fortsatt
dedikerte hjørnefeller; databladet skal si det ærlig i stedet for å late
som panelet er magi.

### Mekanikken
Spjeld + membranlås = to bevegelige deler per panel, null elektronikk.
Levetidskrav: 10 000 omstillinger uten tonal endring (testrigg: motor +
teller, kjøres en helg). Toleransekravet er reelt: 0,5 mm glipe i lukket
modus punkterer membranvirkningen — tetting med filtlepper, målt, ikke
antatt.

### Det simuleringen ikke fanger
Sabine antar diffust felt — smårom er ikke diffuse, så tallene er
retningsgivende, ikke kontraktuelle. Impedansrør- eller in-situ-måling
av prototypepanelet (α per tredjedels oktav, alle tre stillinger) er
obligatorisk før datablad publiseres. Telefonmikrofon-variasjonen i
appen håndteres med kalibreringsprofiler og relative (ikke absolutte)
før/etter-målinger — appen skal si «bedre/verre og hvor mye», ikke
utgi seg for å være Brüel & Kjær.

### Verifikasjon i prototyp
Pass/fail: målt α-forskjell mellom åpen og lukket modus ≥ faktor 3 ved
1 kHz OG målbar membrantopp α ≥ 0,6 i 80–140 Hz-båndet; app-anbefaling
forbedrer målt RT60-flathet i tre ulike testrom mot naiv lik-stilling.

---

## SIDE 32 — MARKED OG PROTOTYP

### Marked
Tre segmenter, samme panel:
1. **Hjemmestudio/innholdsproduksjon.** Enormt og globalt; podkast- og
   YouTube-økonomien kjøper akustikk for utseende like mye som funksjon.
   Kjøper 4–8 paneler av gangen.
2. **Kontor/møterom.** Teams-rom-akustikk er blitt innkjøpspost;
   omstillbarhet er et konkret argument (samme rom: presentasjon vs
   videokonferanse).
3. **Musikere i leiligheter** — øving (absorber mye) vs innspilling
   (reflekter) i samme rom.

Konkurranse: GIK, Vicoustic, EQ Acoustics — statiske paneler, 900–2 500
NOK/stk. Variabel akustikk finnes kun som prosjektleveranse i proffbygg.
AKUSTIKKPROFIL: **1 990 NOK/panel**, 4-pakk 6 990. BOM-mål: 520 NOK.
Premien mot statiske paneler er liten nok til at omstillbarheten ikke
må *bevises* før kjøp — den må bare være sann etterpå.

Kanal: direktesalg + studioutstyrsforhandlere; innholdsmarkedsføring er
hjemmebane (før/etter-lyd i egne miksevideoer — demonstrasjonen er
hørbar, og jeg lager slikt innhold uansett).

### Prototyp
| Post | NOK |
|---|---|
| 4 paneler: ramme, kjerne, perforert front, spjeldmekanikk | 4 800 |
| Membranmateriale-varianter (3 massebelegg for tuning) | 900 |
| Måleutstyr: kalibrert mikrofon har jeg; impedansrør-leie (NTNU/SINTEF-klasse) | 5 500 |
| Slitasjerigg | 700 |
| App: sweep + RT60 på eksisterende open source-kjerne (egen tid) | 0 |
| **Sum** | **11 900** |

Byggetid 6 uker: uke 1–2 mekanikk-iterasjon (glipetoleransen), uke 3–4
tuning av membranmodus, uke 5 måling, uke 6 app-sløyfe i tre rom.

### Dom
**BYGG — men som «rolig» prosjekt.** Ingen tidskritikalitet (ingen
sesong, ingen konkurrent i bevegelse), moderat oppside per enhet, men
høy strategisk verdi: det deler målerigg, app-kode og innholdskanal med
STILLEPROP og LYDSKALPELL. Akustikk-klyngen i porteføljen blir sterkere
enn summen av delene. Dette panelet er limet.
