# 9. EDGEHUB
## Lokal AI-automasjonsserver for småbedrifter
### Sider 27–29

---

## SIDE 27 — IDÉ OG DESIGN

### Kilde
n8n-arbeidet og AI-monetiseringskursene. Mønsteret etter titalls
SMB-samtaler er alltid det samme: de vil ha automasjonen, de forstår
verdien, og så stopper alt på to ting — abonnementströtthet (åtte SaaS-er
à 400 kr/mnd) og en diffus men helt korrekt uro for hvor dataene deres
havner når regnskapet flyter gjennom tre amerikanske skyer. Svaret jeg
alltid ender med å gi dem finnes ikke som produkt. Så jeg bygger det.

### Problem
Norske småbedrifter (regnskapskontor, advokater, klinikker, håndverk)
vil automatisere dokumentflyt og e-post med AI, men skyløsninger koster
2–4 000 NOK/mnd løpende og krever at klientdata sendes ut av huset —
som for flere av dem er et reelt compliance-problem, ikke en følelse.

### Produkt
En ferdig konfigurert boks som står i hylla på kontoret: n8n +
lokal LLM + vektorbase + norske ferdigmoduler. Fakturamottak,
e-postklassifisering, dokumentuttrekk, purringer — kjørende lokalt,
data forlater aldri bygget. Solgt som apparat + støtteabonnement,
ikke som plattform.

### Design
- **Jern:** N100-klasse x86, 32 GB RAM, 1 TB NVMe, NPU-akselerator,
  viftedesign under 22 dBA (den står i et kontorlandskap — akustikk-
  kompetansen gjelder også her). 11 W snittforbruk.
- **Programvare:** n8n som motor, kvantisert 8B-modell for norsk tekst
  (dokumentklassifisering, uttrekk, utkast — ikke sanntidschat, side 28),
  Whisper for taleopptak→notat, alt bak lokal web-UI.
- **[ORIGINAL] Bransjemoduler som produkt, ikke plattform som produkt:**
  konkurrentene (alle «self-hosted AI»-prosjekter) selger muligheter og
  overlater konfigurasjonen til kunden — som er nøyaktig grunnen til at
  SMB-er ikke er der. EDGEHUB selges per *bransje* med ferdige, norske
  arbeidsflyter: «Regnskapskontor-utgaven» leser norske faktura-formater
  (EHF!), kjenner MVA-koder, snakker med Tripletex/Fiken via API.
  Kursmaterialet mitt er allerede halvveis disse modulene — produktet er
  kursene kompilert til kjørbar form.
- **Drift:** krypterte, signerte oppdateringer; støtteabonnement gir
  modul-oppdateringer og fjernhjelp *ved eksplisitt samtykke per økt* —
  ingen stående fjernaksess. Tilliten er produktegenskapen; den brytes én
  gang og aldri mer.

---

## SIDE 28 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 9. Dette produktets
simulering er økonomisk, ikke fysisk — det er der usikkerheten bor.

### Treårskostnad, kundens perspektiv
| | Sky-stabel (SaaS + AI-API) | EDGEHUB |
|---|---|---|
| Anskaffelse | 0 | 14 900 NOK |
| Løpende | 3 200 NOK/mnd | 1 490 NOK/år støtte |
| Strøm | — | 106 NOK/år (11 W × 8 760 t × 1,1 kr) |
| **3 år totalt** | **115 200 NOK** | **19 700 NOK** |

Differansen — ~95 000 over tre år — er før man priser compliance-verdien
av at klientdata aldri forlater kontoret. 3 200/mnd-anslaget er midt i
spennet fra kursdeltakernes faktiske SaaS-regninger; følsomhet: selv
halvert skykost (1 600/mnd) gir 38 000 i besparelse. Caset overlever
konservative tall. Det er testen som betyr noe.

### Ytelse, ærlig spesifisert
8B-modell kvantisert på NPU: **~12 tokens/s.** Det betyr: klassifisere
en e-post <2 s, trekke strukturert data fra en faktura 5–10 s, utkast
til standardsvar 20–30 s. Det betyr også: ingen flytende sanntidschat,
ingen 70B-resonnering. Databladet skal si nøyaktig dette. Overselging av
lokal AI er bransjestandard og den viktigste grunnen til skuffede kunder;
underselging er dermed en differensieringsstrategi i seg selv.

### Kapasitet
N100 + NPU håndterer målkundens last (200–800 dokumenter/dag, kø-basert)
med timevis av idle. Flaskehalsen er ikke regnekraft men *integrasjons-
bredde* — hver ny regnskapsplattform-API er utviklingsuker. Derfor
bransjemoduler i streng rekkefølge etter markedsstørrelse, ikke etter
forespørsel.

### Det simuleringen ikke fanger
Support-kostnaden. Maskinvare hos ikke-tekniske kunder genererer
henvendelser; 1 490/år må dekke snittet. Mitigering: flåtestyring med
helse-telemetri (opt-in, aggregert, aldri innhold), utskiftingsenhet i
posten ved havari («swap, ikke reparer»). Modellert støttekost per enhet
per år: 400–700 NOK ved 50+ enheter. Marginen tåler det dobbelte.

### Verifikasjon i prototyp
Pass/fail: tre pilotkunder (ett regnskapskontor, én advokat, én klinikk)
kjører 60 dager; ≥90 % av dokumentene behandles uten manuell inngripen,
og null support-hendelser som krever fysisk oppmøte.

---

## SIDE 29 — MARKED OG PROTOTYP

### Marked
SSB: ~380 000 aktive foretak i Norge under 20 ansatte; realistisk
segment (dokumenttunge, compliance-bevisste) er titusener. Begynn der
domenekunnskapen er dypest og betalingsviljen mest dokumentert:
**regnskapskontor** (~2 700 i Norge, snitt 5–15 ansatte, drukner i
dokumentflyt, fakturerer per time og kjenner dermed prisen på manuelt
arbeid bedre enn noen).

Konkurranse: skyplattformene (som er det kunden flykter fra), rene
self-hosted-prosjekter (krever IT-kompetanse kunden ikke har), og
IT-konsulenter som bygger engangs-løsninger (dyrere, uvedlikeholdt).
Ingen selger norsk bransjeferdig lokal AI i appliance-format.

Pris: **14 900 NOK + 1 490/år**, alternativt 690/mnd leasing (SMB-er
elsker OPEX). BOM: 4 200 NOK. Kanal: regnskapsbransjens egne kanaler
(Regnskap Norge-messen), kursdeltaker-basen min som varme leads —
distribusjonsfordelen ingen konkurrent har.

### Prototyp
| Post | NOK |
|---|---|
| 3 × mini-PC med NPU (pilotenheter) | 12 600 |
| Kabinett-redesign for støy (dempet, testet) | 1 800 |
| Programvare: n8n-moduler, modell-tuning, UI | egen tid |
| EHF-testdata, API-sandkasser (Fiken/Tripletex) | 0 |
| **Sum** | **14 400** |

Byggetid: 5 uker programvare (modulene finnes som kursmateriale — dette
er kompilering og herding, ikke nybrott), 1 uke enhetsklargjøring,
deretter 60-dagers pilot. Regulatorisk: databehandleravtale-mal og
GDPR-dokumentasjon skrives én gang og *er* salgsmateriell i dette
segmentet.

### Dom
**BYGG.** Kortest vei fra eksisterende kompetanse til fakturerbar
inntekt i hele porteføljen, null fysikk-risiko, og pilotkundene finnes
allerede i kursdeltakerlisten. Dette er porteføljens kontantstrøm-motor
som finansierer jernvare-produktene.
