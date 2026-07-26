# Patentnotat 001 — Riblet-geometri for lavhastighets droneskrog

**Dato:** 2026-07-26
**Oppfinner:** Alexander, Bergen
**Syklus:** 1/17
**Tidsstempel:** git-commit på branch `claude/regnviking-30h-openclaw-hgmlq7`
**Status:** ⚠️ **IKKE PATENTERBAR SLIK DEN STÅR** — mangler måledata. Se seksjon 9.

> Arbeidsdokument, ikke juridisk rådgivning. Norsk/europeisk praksis krever **absolutt
> nyhet**: én offentlig visning før søknadsdato ødelegger patenterbarheten permanent.
> Rekkefølge: dokumentér → mål → vurdér søknad → publisér.

---

## 1. Problemet

Riblet-litteraturen (Bechert, Walsh, NASA/Airbus-studiene) er utviklet for og validert i
transsonisk og høy-subsonisk regime: fly ved 200–250 m/s, Re_x i størrelsesorden 10⁷–10⁸,
rilleavstander på 30–80 µm. Småfly-droner opererer to størrelsesordener lavere: 10–40 m/s,
Re_x ~10⁵–10⁶.

Ingen har publisert en enkel, brukbar dimensjoneringsregel for dette regimet — og
skaleringen er ikke åpenbar, fordi den optimale rilleavstanden bestemmes av den viskøse
lengdeskalaen δ_ν = ν/u_τ, som vokser når farten faller. Ved 20 m/s havner s rundt 260 µm,
altså 3–8 ganger grovere enn flyriller. Det er i et helt annet produksjonsvindu.

## 2. Den tekniske effekten (påstått, ikke målt)

Redusert turbulent skjærmotstand ved langsgående riller med s⁺ = s·u_τ/ν i området 15–20 og
h/s ≈ 0.5. Litteraturen rapporterer 5–10 % reduksjon i det validerte regimet.

**For dronehastigheter er dette en ekstrapolasjon, ikke et resultat.** Det er nettopp
hullet, og det er derfor måling er hele oppgaven.

## 3. Løsningen

- **Geometri:** trekantriller, langsgående med strømningsretningen
- **Dimensjonering:** s = s⁺·ν/u_τ med s⁺ = 16; h = 0.5·s
- **Arbeidspunkt 20 m/s, 0.5 m bak forkant, 15 °C, havnivå:** s = 260 µm, h = 130 µm
- **Arbeidspunkt 25 m/s, 0.6 m, −20 °C, 500 moh (arktisk):** s = 186 µm, h = 93 µm
- **Materiale:** SLA/DLP-resin, eller påført film
- **Prosess:** SLA-print direkte i skallet, alternativt printet negativ + preging i film
- **Gyldighetsområde:** Re_x mellom 5·10⁵ og 10⁷ (turbulent grensesjikt kreves — under det
  gir rillene ingenting, se seksjon 5)

Beregningen er implementert og verifisert i `../riblet-kalkulator/riblet.py` (10 enhetstester)
og speilet i `index.html`. Begge gir identiske tall.

## 4. Hva som er nytt — foreløpig vurdering

**Ikke gjort ennå.** Nyhetssøket er neste handling. Sjekkliste:

- [ ] Google Patents: `riblet drag reduction UAV`, `riblet spacing low Reynolds`, `shark skin drone`
- [ ] Espacenet: IPC-klasser B64C 1/38, B64C 21/10, F15D 1/00
- [ ] Google Scholar: «riblets low Reynolds number», «riblets Re_x 10^5»
- [ ] Marked: eksisterende riblet-filmer (aerospace-leverandører) — hvilke dimensjoner selges?

Forventet funn: rikelig med kunst på riblets generelt. Det er greit — spørsmålet er ikke om
riblets er kjent, men om **denne dimensjoneringen for dette regimet med denne
produksjonsmetoden** er beskrevet.

## 5. Hvorfor det kanskje ikke er åpenbart

Tre kandidater, i synkende styrke:

1. **Produksjonsvinduet er kvalitativt annerledes.** 260 µm kan SLA-printes direkte i skallet
   av en enkeltperson. 40 µm kan det ikke. Det gjør riblets tilgjengelige for en produsentklasse
   som var utestengt — og det er en teknisk konsekvens, ikke bare en økonomisk.
2. **Grensesjiktet er ofte laminært der man vil sette rillene.** Ved 20 m/s ligger den
   turbulente overgangen rundt 0.37 m bak forkanten. Foran det gjør rillene **skade**.
   Det gir en ikke-triviell posisjonsavhengig påføring — riller kun bak et beregnet punkt —
   som er stikk i strid med hvordan riblet-film brukes på fly (hele overflaten).
3. **Arktisk kobling:** samme geometri påvirker vannfilm og isakkumulering på forkanten.
   Hvis riller dimensjonert for motstandsreduksjon også gir målbart forsinket ising, er
   dobbelfunksjonen den sterkeste patentvinkelen i hele notatet. Uutforsket.

## 6. Kravskisse (rå, skal omskrives av rådgiver)

> **1.** Aerodynamisk overflate for et ubemannet luftfartøy med driftshastighet under 50 m/s,
> omfattende langsgående riller med avstand s og høyde h, **kjennetegnet ved at** rillene er
> anordnet utelukkende i det området av overflaten der den lokale Reynolds-tallverdien Re_x
> overstiger 5·10⁵, og at s er valgt slik at s·u_τ/ν ligger mellom 15 og 20 ved
> driftshastigheten.
>
> **2.** Overflate ifølge krav 1, der s er mellom 150 og 400 µm og h/s er mellom 0.4 og 0.6.
>
> **3.** Overflate ifølge krav 1 eller 2, der rillene er dannet i ett stykke med skallet ved
> stereolitografisk additiv produksjon.
>
> **4.** Fremgangsmåte for dimensjonering av en overflate ifølge krav 1, omfattende bestemmelse
> av overgangspunktet for turbulent grensesjikt ved driftshastigheten, og påføring av riller
> kun bak dette punktet.

Det som står etter «kjennetegnet ved» er det som eventuelt eies. **Krav 1 og 4 er de
interessante** — posisjonsavhengigheten er det minst åpenbare elementet.

## 7. Bevis

- [x] Beregningsmodell med tester: `../riblet-kalkulator/riblet.py`
- [x] Verifisert mot håndregning på arbeidspunktet 20 m/s / 0.5 m
- [ ] **Måledata — mangler. Dette er blokkeringen.**
- [ ] CAD/print av testpanel
- [ ] Uavhengig repetisjon

## 8. Publiseringssperre

- [x] **Ingenting publiseres om posisjonsavhengig påføring (krav 1 og 4) før nyhetssøk er gjort.**
- **Greit å publisere nå:** kalkulatoren selv, formlene, at riblets virker generelt. Alt dette
  er kjent teknikk og er hele leadmagnet-verdien.
- **Ikke greit å publisere nå:** «riller kun bak turbulensovergangen» som en anbefaling, og
  enhver kobling riller ↔ ising.
- Sperren gjelder til: nyhetssøk fullført + vurdering tatt.

## 9. Ærlig dom

Dette notatet dokumenterer en **hypotese med dato**, ikke en oppfinnelse. Kalkulatoren
implementerer kjent teknikk og er ikke patenterbar — den er et distribusjonsverktøy, og bør
publiseres fritt.

Det eventuelle patentet ligger i to ting, og begge krever måling:
- posisjonsavhengig påføring bak turbulensovergangen (krav 1 og 4)
- dobbelfunksjonen motstand + ising, hvis den finnes

Uten måledata er kravene gjetning, og en patentsøknad basert på gjetning er penger brent.

## 10. Neste handling

**Innen 2026-08-02:** nyhetssøk i Google Patents og Espacenet på listen i seksjon 4. To timer.
Det avgjør om det i det hele tatt er noe her — og det koster ingenting.

**Deretter, når vindtunnel-riggen finnes:** mål de to panelene etter protokollen i
kalkulatoren. Uten den målingen stopper dette sporet permanent på notat-stadiet.
