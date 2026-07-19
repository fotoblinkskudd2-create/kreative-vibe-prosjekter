# Sonisk Kunst

Lyd → algoritmisk kunst. Komplett system, null librosa — all DSP (STFT, spektral
centroid, chroma, onset-deteksjon, tempo via autokorrelasjon, toneartsestimat
med Krumhansl-Schmuckler) er implementert direkte på numpy/scipy.

## Kjør

```bash
pip install -r requirements.txt

# Demo: syntetiserer en drone i A-moll @ 72 BPM og visualiserer den
python -m sonisk_kunst --demo

# Egen lyd
python -m sonisk_kunst spor.wav --engine mandala   # eller flowfield | particles | alle

# Kun analyse (JSON)
python -m sonisk_kunst spor.wav --analyse
```

## Motorer

| Motor | Idé | Lyd → bilde |
|---|---|---|
| `mandala` | Tiden leses innenfra og ut som ringer | chroma → farge, centroid → detaljfrekvens, RMS → strektyngde, onsets → lyspunkter |
| `flowfield` | Partikler driver gjennom spektralformet vektorfelt | centroid → turbulens, RMS → steglengde/tyngde, chroma → farge per bane |
| `particles` | Onsets eksploderer langs tidsaksen | RMS → midtbånd, onset-energi → partikkelfart og antall |

## Fargelogikk

Toneart styrer paletten: dur → varmt (rød/oransje/gul), moll → kaldt
(blå/fiolett). Pitch-klasser roterer hue langs kvintsirkelen, slik at
harmonisk nære toner får beslektede farger. Se `sonisk_kunst/palette.py`.

## Live-versjon

`web/index.html` — åpne i nettleser. Sanntidsmandala fra mikrofon via Web Audio;
faller tilbake til en syntetisk drone hvis mikrofon avvises. Null avhengigheter.

## Verifisert

Demolyden syntetiseres i A-moll @ 72 BPM med pulser på beatet. Pipelinen
detekterer **A minor, 72 BPM, 28 onsets** — eksakt riktig. Se `demo/`.

## Struktur

```
sonisk_kunst/
  dsp.py        analysepipeline (STFT, centroid, chroma, onsets, tempo, toneart)
  palette.py    harmonisk fargelogikk
  synth.py      demolyd-generator
  engines/      mandala, flowfield, particles
  __main__.py   CLI
web/index.html  live-visualisering (Web Audio + canvas)
demo/           genererte eksempler
```
