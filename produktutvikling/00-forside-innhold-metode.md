# TI PRODUKTER
## Fra idé til prototyp. Design, marked, simulering.
### Alexander Nordmann — Bergen, juli 2026
### Dokumentasjon: 33 sider

---

## SIDE 1 — FORSIDE OG INNHOLD

Dette dokumentet er hele prosessen for ti nye, originale produkter. Ikke kunst.
Ikke tull. Produkter som kan bygges, prises og selges. Alle er avledet fra ting
jeg allerede har jobbet med: dronedesign, akustisk analyse, U-864-saken,
n8n-automasjon, fermentering, vintage-sykler, musikkmaskinvare. Råstoffet er
kjent terreng. Produktene er nye.

Hvert produkt får tre sider: idé og design, simulering med tall, marked og
prototypplan med dom. Simuleringene er førsteordens fysikk kjørt i Python
(`simulering/sim_alle_produkter.py`, resultater i `simulering/resultater.txt`).
Førsteordens er nok til å drepe dårlige idéer gratis. Prototypen dreper resten.

### Innhold

| Side | Innhold |
|---|---|
| 1–2 | Forside, innhold, metode |
| 3–5 | 1. FJORDVAKT — autonom miljøbøye for fjordovervåking |
| 6–8 | 2. VRAKØYE — kompakt inspeksjons-ROV til 200 m |
| 9–11 | 3. STILLEPROP — lavstøypropell for urbane droner |
| 12–14 | 4. ISFRI — pulset de-ising for vinterdroner |
| 15–17 | 5. SKREDLYTT — geofon/infralyd-nett for skredvarsling |
| 18–20 | 6. LYDSKALPELL — håndholdt akustisk kamera |
| 21–23 | 7. HEVEKAMMER — fermenteringskammer som måler heving, ikke tid |
| 24–26 | 8. RETROVOLT — reversibel elektrifisering av vintagesykler |
| 27–29 | 9. EDGEHUB — lokal AI-automasjonsserver for SMB |
| 30–32 | 10. AKUSTIKKPROFIL — mekanisk adaptiv absorbent |
| 33 | Portefølje, prioritering, veikart |

Ti produkter er ikke ti selskaper. Side 33 sier hvilke tre som bygges først
og hvorfor de syv andre venter.

---

## SIDE 2 — METODE

### Prosessen

Samme løp for alle ti. Ingen unntak, ingen favorisering.

1. **Kilde.** Hvilket eksisterende arbeid produktet vokser ut av. Et produkt
   uten rot i egen kompetanse er en gamblingkupong.
2. **Problem.** Én setning. Hvis problemet trenger et avsnitt, er det ikke
   et problem, det er en stemning.
3. **Design.** Arkitektur, nøkkelkomponenter, det ene tekniske valget som
   skiller produktet fra hyllevare.
4. **Simulering.** Førsteordens fysikk: energibudsjett, effekt, akustikk,
   termikk, rekkevidde. Tall eller død. Alle beregninger ligger i repoet og
   kan kjøres på nytt.
5. **Marked.** Norge først, tall der de finnes, konkurrenter navngitt,
   pris satt. «Stort marked» uten divisor er støy.
6. **Prototyp.** Stykkliste med kostnad, byggetrinn, verifikasjonskriterium.
   En prototyp uten pass/fail-kriterium er hobby.
7. **Dom.** Bygg, vent eller drep. Skrevet ned, så jeg ikke kan lyve for
   meg selv senere.

### Regler

- Alle tall i NOK og SI. Estimater merkes som estimater.
- Ingen «disruptiv», ingen «revolusjonerende», ingen «AI-drevet» uten at
  AI faktisk gjør jobben.
- Hver prototyp skal koste under 40 000 NOK og ta under 8 uker. Over det er
  det ikke en prototyp, det er et prosjekt.
- Regulatorikk nevnes der den biter: luftfart (EASA/Luftfartstilsynet),
  CE/RED for radio, mat-kontakt for HEVEKAMMER, sjøfart for FJORDVAKT.
- Originalitetskrav: minst ett designvalg per produkt som ikke finnes hos
  navngitte konkurrenter. Det valget er merket **[ORIGINAL]** i hver spec.

### Hva simuleringene er, og ikke er

Momentum-teori for rotorer, Sabine for romakustikk, Rayleigh for array-
oppløsning, enkel drag- og rullemotstand for kjøretøy, UA-verdier for
termikk, strømbudsjett for batterinoder. Ikke CFD, ikke FEM, ikke
klimakammer. Feilmargin ±30 %. Poenget er rekkefølgen på sifrene, ikke
desimalene. Der førsteordens sier «umulig», er svaret umulig. Der den sier
«mulig», sier prototypen resten.

### Stil

Dokumentet er skrevet slik jeg jobber: kort, tall først, konklusjon i hver
seksjon, ingen pynt. Der noe er usikkert, står det at det er usikkert.
Der noe er dårlig, står det at det er dårlig. To av de ti produktene får
dommen «vent». Det er ikke en svakhet ved dokumentet. Det er dokumentet
som virker.
