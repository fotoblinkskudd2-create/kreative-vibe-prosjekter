# DJUPVARSEL

**Kjøring:** Genius Idea Engine v2.0, Variant 1 (Master) — 2026-06-28
**Felt kombinert:** Marin biomimetikk + AI lydanalyse + psykisk helse + maritim infrastruktur

---

## Problem

Norske fiskere har en av de høyeste selvmordsratene blant yrkesgrupper i landet — isolasjon på havet i ukevis, ingen privatliv, ingen psykolog innen radiorekkevidde, og en kultur der "du tar deg sammen" fortsatt vinner over å be om hjelp. Alt mental-helse-tech som finnes (inkludert mitt eget PanicSafe) krever at brukeren *selv* åpner en app og trykker en knapp. Problemet er at folk i akutt krise på et fiskefartøy midt i Barentshavet ikke åpner apper. De ringer ikke. De går bare stille ut på dekk om natten. Ingen sensor, ingen varsling, ingen app løser et problem som krever at offeret selv rapporterer det.

Samtidig: norske kystbøyer (værbøyer, fiskebruks-bøyer, oppdrettsanlegg-bøyer) gror tette av rur og skjell på 4-8 uker i kaldt vann, og krever dykker-vask eller utskifting. Det er en kjent, dyr, løst-med-kjemikalier-problem som ingen har løst biomimetisk i norsk skala.

To separate problemer. Én bøye kan løse begge — hvis den er bygget riktig.

## Løsning

**DJUPVARSEL**: en nettverk av autonome, tare-inspirerte overflatebøyer langs fiskefelt og faste ruter (Lofoten, Senja, Finnmarkskysten), som gjør to ting samtidig:

1. **Biomimetisk skrog**: Bøyens forankringsline og flytekropp er formet etter stilken på *Laminaria hyperborea* (stortare) — fleksibel, bøyer seg med strøm og bølger i stedet for å stå stivt og slite seg løs eller knekke i is. Overflaten er belagt med en biomimetisk mikrostruktur inspirert av blåskjellets byssus-protein-feste, men invertert: i stedet for å feste rur, *hindrer* den biofilm-dannelse ved konstant mikro-fleksing av overflaten (samme prinsipp som hai-hud-riblets hindrer is, bare brukt mot skjell/rur i saltvann istedenfor mot is i luft). Ingen kjemikalier, ingen kobberbasert antifouling-maling som DNV/Miljødirektoratet stadig strammer inn på.

2. **Passiv akustisk krise-triage**: Bøyen lytter passivt på VHF-kanaler og lokal radiotrafikk fra fartøy i nærheten (med samtykke fra rederi/fiskerlag, ikke avlytting av privatsamtaler — kun arbeidskommunikasjon på fellesfrekvens, som allerede er semi-offentlig). En liten edge-AI-modell, trent for å filtrere ut motorlyd og vind, leser vokal prosodi — pitch-variasjon, talehastighet, pauselengde, energinivå — markører som er godt dokumentert i klinisk forskning for depresjon og akutt risiko. Den vurderer *ikke* innhold (ingen overvåking av hva som sies), bare *hvordan* det sies. Hvis mønsteret over tid (ikke ett enkelt kall) tipper mot akutt risiko-profil, sender bøyen et anonymisert varsel til rederiets sikkerhetsansvarlige eller fiskerlagets helsekontakt — ikke til myndigheter, ikke med navn — kun "økt bekymring registrert på frekvens X, sjekk inn med mannskapet."

Ingen app. Ingen knapp. Ingen selvrapportering. Bøyen er allerede der for værdata — krisevarslingen er en stille bonus-funksjon ingen trenger å huske å bruke.

## Innovasjonshøyde

Dette er nytt fordi ingen har koblet **marin biofouling-biomimetikk** og **maritim mental-helse-overvåking** i samme fysiske enhet. De to feltene eksisterer i helt separate bransjer (havbruksteknologi vs. helse-tech) og snakker aldri med hverandre. Eksisterende krise-varslingsteknologi (apper, wearables, knapper) krever alle aktiv handling fra brukeren. Passiv prosodi-basert triage finnes i forskningsmiljøer (akademiske studier på samtale-opptak), men er aldri bygget inn i allerede-eksisterende maritim infrastruktur som folk uansett ikke kan fjerne eller ignorere. Antifouling-løsningen er separat patenterbar i seg selv — biomimetisk mikro-flex-overflate uten kjemikalier er fortsatt et åpent felt i norsk akvakultur/maritim sektor.

## Patentpotensial

To separate, men koblede patentspor:

1. **Mekanisk/overflate-patent**: "Selvflektende antifouling-overflatestruktur for marine bøyer basert på tare-stilk-fleksibilitet" — søk i Patentstyret og EPO på "biomimetic flexible antifouling buoy" viser stort sett stive coating-patenter (kobber, silikon, nanostruktur-overflater som IKKE beveger seg). Bevegelig, strøm-drevet mikroflex som aktiv antifouling-mekanisme er et reelt prior-art-hull.
2. **System-patent**: "Passivt akustisk triage-system for maritim krisevarsling basert på prosodisk analyse uten talegjenkjenning av innhold" — søk på "maritime vessel crew mental health acoustic monitoring" gir nesten ingenting i patentdatabaser. De fleste patenter i "voice stress detection" er callcenter/forsikringssvindel-rettet, ikke maritim sikkerhet. Hold patentsøknaden smal på "innhold-blind prosodi + maritim VHF-kontekst-filtrering" for å unngå overlapp med generiske voice-stress-patenter.

Søk PCT-rute via Patentstyret innen 12 måneder fra første offentlige prototype-demo for å bevare nyhetskravet.

## Teknisk gjennomførbarhet (48h-prototype steg + verktøy)

48-timers mål: bevis at (a) mikroflex-overflaten reduserer biofouling-vedheng målbart i en tank, og (b) en edge-AI kan skille "stresset prosodi" fra "normal arbeidsprat" i støyfylt lydmiljø.

- **Time 0-6**: 3D-print en liten test-flate (PETG eller TPU for fleksibilitet) med riblet/finstruktur inspirert av tare-overflate-bilder (åpne marinbiologi-datasett/foto). Fest til en servo-drevet vippe-rigg (Arduino + micro-servo) som simulerer bølge-fleksing hvert 3-5 sekund.
- **Time 6-12**: Legg test-flaten og en kontroll-flate (stiv, samme materiale) i et akvarium med saltvann + reelle blåskjell-/rur-larver hvis tilgjengelig lokalt (Bergen — Havforskningsinstituttet eller UiB Marinbiologi har ofte levende kultur), ellers simuler med biofilm-dyrking (alge-suspensjon) over 48h som proxy.
- **Time 12-24**: Bygg lyd-pipeline: Python + `librosa` for prosodi-features (pitch/F0-varians via `librosa.pyin`, talehastighet via VAD-segmenter med `webrtcvad`, energi-kontur). Tren ikke en full modell på 48h — bruk en enkel terskel-/regelbasert klassifikator på 3-5 features, kalibrert på offentlig tilgjengelige emotional-speech-datasett (RAVDESS, CREMA-D) som proxy for "stresset vs. normal" tale.
- **Time 24-36**: Legg på motorlyd-støy (gratis maritim-motor-lydopptak fra Freesound.org) over test-talen og verifiser at en enkel spektral subtraksjon (`noisereduce`-biblioteket i Python) holder klassifikatoren funksjonell over støy.
- **Time 36-48**: Pakk demo i en enkel Raspberry Pi + USB-mikrofon-rigg, kjør live-demo: spill av maritim VHF-lignende lyd med innbakt "stresset" og "normal" segment, vis at systemet flagger riktig segment. Lag en 90-sekunders video av begge del-demoene (mekanisk flex-tank + lyd-klassifikator) for investor/grant-pitch.

Verktøy: Arduino/ESP32, micro-servo, TPU-filament, Python (`librosa`, `webrtcvad`, `noisereduce`, `scikit-learn` for terskel-modell), Raspberry Pi 4, RAVDESS/CREMA-D datasett (gratis, akademisk lisens), Freesound.org (CC-lyd).

## Marked & Konkurrentbilde

- **Antifouling-marked**: Dominert av kjemiske coatings (International Paint, Jotun — norsk gigant i Bergen selv) og kobberbaserte løsninger under økende EU-regulatorisk press. Ingen stor aktør har en mekanisk/biomimetisk løsning i bøye-segmentet spesifikt — de fokuserer på skipsskrog.
- **Maritim sikkerhet/helse-tech**: Garmin inReach, ZOLEO og lignende er nødsignal-enheter — krever aktiv knapp-trykk. Ingen tilbyr passiv psykisk-helse-triage. Kongsberg Maritime og lignende fokuserer på navigasjon/sikkerhet mekanisk, ikke mental helse.
- **Konkurrentbilde er i praksis tomt** for den spesifikke kombinasjonen — risikoen er ikke konkurranse, men at fiskerlag/rederier er konservative og treg i adopsjon av noe som "lytter."

## White-space analyse

Hullet er strukturelt, ikke teknisk: havbruks- og maritim-utstyrsbransjen bygger fysisk infrastruktur og snakker aldri med helse-tech-bransjen. Helse-tech bygger for individet med en smarttelefon i hånden, ikke for et fartøy som allerede har bøyer i vannet uansett. DJUPVARSEL sitter nøyaktig i sømmen mellom disse to verdenene — og fordi bøyen allerede er der for vær/navigasjonsdata, er mental-helse-funksjonen en marginal tilleggskostnad, ikke et nytt kjøp noen må overbevises om å gjøre. Det er white-space fordi ingen i hver bransje tenker på den andre bransjens problem.

## Prototype/MVP plan (copy-paste-klar kode/plan)

```python
# prosody_triage.py — minimal demo-klassifikator
import librosa
import numpy as np
import webrtcvad
import noisereduce as nr

def extract_features(audio_path, sr=16000):
    y, _ = librosa.load(audio_path, sr=sr)
    y_denoised = nr.reduce_noise(y=y, sr=sr)

    f0, voiced_flag, _ = librosa.pyin(
        y_denoised, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7')
    )
    f0_voiced = f0[voiced_flag]
    pitch_var = np.nanstd(f0_voiced) if len(f0_voiced) else 0.0

    energy = librosa.feature.rms(y=y_denoised)[0]
    energy_mean = float(np.mean(energy))

    vad = webrtcvad.Vad(2)
    frame_len = int(sr * 0.02)
    speech_frames = 0
    total_frames = 0
    pcm = (y_denoised * 32768).astype(np.int16).tobytes()
    for i in range(0, len(pcm) - frame_len * 2, frame_len * 2):
        frame = pcm[i:i + frame_len * 2]
        if len(frame) == frame_len * 2:
            total_frames += 1
            if vad.is_speech(frame, sr):
                speech_frames += 1
    speech_rate = speech_frames / total_frames if total_frames else 0.0

    return {"pitch_var": pitch_var, "energy_mean": energy_mean, "speech_rate": speech_rate}

def triage(features, baseline):
    score = 0
    if features["pitch_var"] < baseline["pitch_var"] * 0.6:
        score += 1  # flat affect
    if features["energy_mean"] < baseline["energy_mean"] * 0.5:
        score += 1  # low vocal energy
    if features["speech_rate"] < baseline["speech_rate"] * 0.6:
        score += 1  # long pauses / slow speech
    return "FLAGG: økt bekymring" if score >= 2 else "normal"
```

MVP-rigg: ESP32 + INMP441 mikrofon i en vanntett boks montert på en eksisterende værbøye (lån/lease fra et fiskerlag i Vestland for pilot), kjører `prosody_triage.py`-logikken on-device (TensorFlow Lite-konvertert versjon etter at terskel-modellen er validert), sender kun flagg + bøye-ID over LoRaWAN til en enkel dashboard-app (samme stack som PanicSafe-backend, gjenbrukt — ikke samme konsept, samme infrastruktur).

## Risiko & Mitigering

- **Personvern/overvåkingsfrykt**: Fiskere vil oppfatte "lyttende bøye" som spionasje. Mitigering: full transparens, samtykke-basert opt-in per fartøy/rederi, innhold-blind prosessering on-device (rålyd lagres aldri, kun feature-vektorer i 10 sekunder før de slettes), tredjeparts revisjon (f.eks. Datatilsynet-dialog tidlig).
- **False positives → alarm-fatigue**: Mitigering: krev mønster over tid (minimum 3 separate VHF-kall over >2 timer), ikke enkelthendelse, og send varsel til menneske (sikkerhetsansvarlig) som gjør vurdering — aldri automatisk inngripen.
- **Biofouling-løsningen funker ikke i praksis (tare-flex er ikke nok mot rur i kaldt vann)**: Mitigering: 48h-tanktest gir tidlig signal; hvis mekanisk løsning ikke holder, pivoter til kun lyd-triage-delen som står på egne ben som produkt.
- **Regulatorisk**: Maritim helseovervåking kan trigge Helsepersonelloven/GDPR-spesialkategori-data-krav. Mitigering: posisjonér som "sikkerhetsvarsling," ikke "helseovervåking" juridisk — samme mønster som eksisterende mann-over-bord-systemer.

## Videre forskning

1. Kontakt Havforskningsinstituttet (Bergen, samme by) for tilgang på reell biofouling-data fra deres egne bøyer — de har sannsynligvis already-eksisterende vedheng-data du kan bruke som baseline uten å vente på 48h-dyrking.
2. Snakk med Norges Fiskarlag eller et lokalt fiskerlag i Vestland om pilot-samtykke og reelle VHF-opptak (anonymisert) for å trene klassifikatoren på faktisk maritim støy, ikke bare Freesound-proxy.
3. Undersøk eksisterende prosodi-baserte depresjon/risiko-forskning (f.eks. studier fra NTNU psykologi eller internasjonale kliniske prosodi-studier) for å kalibrere terskler mot klinisk validerte markører i stedet for kun skuespiller-datasett (RAVDESS).
4. Patentsøk-dypdykk (Patentstyret + Espacenet) på "antifouling flexible buoy" og "passive vocal stress maritime" for å bekrefte prior-art-hullet før søknad.
5. Grant-spor: Innovasjon Norge (maritim/helse-tech-krysningspunkt) og Forskningsrådet sitt "Havteknologi"-program — begge har søknadsvinduer som passer en kombinert biomimetikk+helse-pitch.

## Inntektsmodell

- **B2B leasing til rederier/fiskerlag**: Bøyen selges/leases som "neste generasjons værbøye med innebygd antifouling og mannskaps-sikkerhetsvarsling" — kunden betaler for værdata + antifouling-besparelse (slipper dykker-vask), mental-helse-funksjonen er en gratis differensiator, ikke hovedsalgsargument (lavere friksjon i salg).
- **SaaS-dashboard**: Abonnement for rederier på sikkerhets-dashbordet (samme mønster som eksisterende flåtestyringssystemer), kr 500-2000/mnd per fartøy avhengig av flåtestørrelse.
- **Grant-finansiert pilot**: Innovasjon Norge/Forskningsrådet-støtte for første 2-3 piloter dekker utviklingskost mens produktet valideres, før kommersiell skalering.
- **Lisensiering av antifouling-overflateteknologien separat**: Hvis mikroflex-løsningen funker, lisensier den til Jotun eller lignende overflate-selskaper som egen IP-strøm uavhengig av helse-produktet.

## Verdi-score (1-100): 78

Høy fordi: reelt, dokumentert problem (fiskerselvmord) møter en løsning som krever null endring i brukeratferd — det er den sjeldne mental-helse-tech-løsningen som ikke er avhengig av at den syke ber om hjelp. Trekker ned fra 90+ fordi adopsjon krever tillit-bygging i en konservativ bransje, og den tekniske mekanisk-delen (tare-mikroflex mot rur) er uprøvd og kan vise seg svakere enn kjemiske alternativer i ekstreme groe-forhold (varmt vann om sommeren i sør). White-space og patentrom er sterkt; markedsadopsjon er den reelle risikoen.

## Gonzo Edge (Banksy/Suno/Midjourney-vinkling)

Banksy-vinkling: en stencil-serie kalt **"Bøyen Som Lyttet"** — svart-hvitt-bilde av en ensom fiskebåt i mørket, og en bøye ved siden av med et øre i stedet for et lys, med teksten *"Ingen ringte. Bøyen hørte det likevel."* Plassert på murer i fiskerikommuner (Senja, Båtsfjord) som gateart-kampanje samtidig med produktlansering — gratis PR, og direkte truth-telling om at systemet (NAV, helsevesen, "ta deg sammen"-kulturen) alltid kommer for sent, men nå kommer maskinen før mennesket gjør det.

Suno-prompt: *"Norwegian black metal/folk hybrid, sparse blast beats fading into a single foghorn drone, lyrics in Bergensk dialect about a fisherman who never called for help and the buoy that heard him anyway, somber and cold, tempo 70 BPM building to 140, title: 'DJUPVARSEL'"* — bruk sangen som lansering-video-soundtrack, ikke bare merch.

Midjourney-prompt: *"a weathered orange sea buoy floating alone in black arctic water at night, faint bioluminescent kelp-like tendrils wrapped around its base, a single warm light glowing from inside like a listening ear, distant fishing trawler lights on the horizon, moody cinematic photography, Bergen fjord aesthetic, hyperrealistic, 35mm --ar 16:9"*
