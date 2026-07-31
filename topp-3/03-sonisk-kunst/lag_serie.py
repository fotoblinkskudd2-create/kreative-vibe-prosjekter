"""Sonisk Kunst — «seriemodus»: ett spor blir en sammenhengende triptyk.

Dette er den foreslåtte produktretningen gjort kjørbar. I stedet for ett bilde
per spor deles sporet i satser, hver sats rendres for seg, og de tre settes i
et trykkeklart ark med herkomststripe (toneart, tempo, varighet, satsvindu).

Motoren ligger ikke i denne mappen — den er hentet fra grenen
`claude/system-review-input-memory-1sjnre`. Pek på den med --kilde:

    git fetch origin claude/system-review-input-memory-1sjnre
    git archive origin/claude/system-review-input-memory-1sjnre sonisk-kunst | tar x
    python3 lag_serie.py --kilde sonisk-kunst

Uten argumenter letes det etter ./sonisk-kunst og ../sonisk-kunst.
"""

import argparse
import pathlib
import struct
import sys
import tempfile
import wave
import zlib

SATSER = [("I", 0.00, 0.34), ("II", 0.33, 0.67), ("III", 0.66, 1.00)]

BREDDE = 2400          # px, arkbredde (A2-forhold ved 300 dpi ~ 4960 px)
MARG = 96
STRIPE_H = 210
BAKGRUNN = (8, 8, 10)
BLEKK = (232, 228, 222)
DEMPET = (128, 122, 116)


def finn_kilde(oppgitt: str | None) -> pathlib.Path:
    kandidater = [oppgitt] if oppgitt else []
    her = pathlib.Path(__file__).parent
    kandidater += [her / "sonisk-kunst", her.parent / "sonisk-kunst",
                   pathlib.Path("sonisk-kunst")]
    for k in kandidater:
        if k and (pathlib.Path(k) / "sonisk_kunst" / "dsp.py").exists():
            return pathlib.Path(k).resolve()
    sys.exit(
        "Fant ikke sonisk_kunst-motoren.\n"
        "Hent den fra grenen og pek på mappen:\n"
        "  git archive origin/claude/system-review-input-memory-1sjnre "
        "sonisk-kunst | tar x\n"
        "  python3 lag_serie.py --kilde sonisk-kunst")


def lag_demospor(sti: pathlib.Path, sr: int = 44100, varighet: float = 36.0,
                 bpm: float = 84.0) -> pathlib.Path:
    """Tre satser i samme toneart, med stigende tetthet — så serien henger sammen."""
    import numpy as np

    t = np.linspace(0, varighet, int(sr * varighet), endpoint=False)
    x = np.zeros_like(t)

    # D-moll: D F A, med skiftende overtoneinnhold per sats
    grunntoner = [146.83, 174.61, 220.00]
    for i, (_, a, b) in enumerate(SATSER):
        maske = (t >= a * varighet) & (t < b * varighet)
        lysstyrke = 0.25 + 0.35 * i          # centroid stiger gjennom stykket
        for f in grunntoner:
            x[maske] += 0.16 * np.sin(2 * np.pi * f * t[maske])
            x[maske] += 0.16 * lysstyrke * np.sin(4 * np.pi * f * t[maske])
            x[maske] += 0.08 * lysstyrke * np.sin(6 * np.pi * f * t[maske])

    # Puls på slaget, tettere utover
    slag = 60.0 / bpm
    for k in range(int(varighet / slag)):
        n0 = int(k * slag * sr)
        andel = k * slag / varighet
        deling = 1 if andel < 0.34 else (2 if andel < 0.67 else 4)
        for d in range(deling):
            i0 = n0 + int(d * slag / deling * sr)
            L = int(0.045 * sr)
            if i0 + L >= len(x):
                break
            x[i0:i0 + L] += (0.42 * np.exp(-np.linspace(0, 9, L))
                             * np.sin(2 * np.pi * 165 * np.arange(L) / sr))

    x /= np.max(np.abs(x)) * 1.02
    with wave.open(str(sti), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(b"".join(struct.pack("<h", int(v * 32767)) for v in x))
    return sti


def klipp_wav(kilde: pathlib.Path, mål: pathlib.Path, a: float, b: float) -> pathlib.Path:
    with wave.open(str(kilde), "rb") as r:
        n, sr, sw, ch = r.getnframes(), r.getframerate(), r.getsampwidth(), r.getnchannels()
        r.setpos(int(n * a))
        data = r.readframes(int(n * b) - int(n * a))
    with wave.open(str(mål), "w") as w:
        w.setnchannels(ch)
        w.setsampwidth(sw)
        w.setframerate(sr)
        w.writeframes(data)
    return mål


def komponer(paneler, meta, ut: pathlib.Path) -> pathlib.Path:
    from PIL import Image, ImageDraw, ImageFont

    n = len(paneler)
    mellomrom = 40
    pb = (BREDDE - 2 * MARG - (n - 1) * mellomrom) // n
    høyde = MARG + pb + STRIPE_H

    ark = Image.new("RGB", (BREDDE, høyde), BAKGRUNN)
    tegn = ImageDraw.Draw(ark)

    def font(størrelse, fet=False):
        navn = ("DejaVuSansMono-Bold.ttf" if fet else "DejaVuSansMono.ttf")
        for sti in (f"/usr/share/fonts/truetype/dejavu/{navn}",
                    f"/usr/share/fonts/dejavu/{navn}"):
            if pathlib.Path(sti).exists():
                return ImageFont.truetype(sti, størrelse)
        return ImageFont.load_default()

    for i, (bilde, (tall, _, _)) in enumerate(zip(paneler, SATSER)):
        im = Image.open(bilde).convert("RGB")
        # Motoren brenner sin egen bildetekst inn nederst. På et ark med egen
        # herkomststripe blir den dobbelt opp — beskjær den bort.
        im = im.crop((0, 0, im.width, int(im.height * 0.94)))
        im = im.resize((pb, pb), Image.LANCZOS)
        x = MARG + i * (pb + mellomrom)
        ark.paste(im, (x, MARG))
        tegn.rectangle([x, MARG, x + pb - 1, MARG + pb - 1], outline=(46, 44, 42))
        tegn.text((x + 6, MARG + pb + 14), f"SATS {tall}", font=font(30, True),
                  fill=DEMPET)

    # Herkomststripe — signaturen som gjør trykket etterprøvbart
    sy = MARG + pb + 78
    tegn.line([MARG, sy, BREDDE - MARG, sy], fill=(52, 50, 48), width=2)

    venstre = [("TONEART", meta["toneart"]),
               ("TEMPO", f"{meta['tempo_bpm']:.0f} BPM"),
               ("VARIGHET", f"{meta['varighet_s']:.0f} s")]
    høyre = [("ONSETS", str(meta["onsets"])),
             ("MOTOR", "mandala"),
             ("FRØ", meta.get("frø", "—"))]

    for j, (nøkkel, verdi) in enumerate(venstre):
        x = MARG + j * 300
        tegn.text((x, sy + 26), nøkkel, font=font(22), fill=DEMPET)
        tegn.text((x, sy + 56), verdi, font=font(38, True), fill=BLEKK)
    for j, (nøkkel, verdi) in enumerate(høyre):
        x = MARG + 1000 + j * 300
        tegn.text((x, sy + 26), nøkkel, font=font(22), fill=DEMPET)
        tegn.text((x, sy + 56), verdi, font=font(38, True), fill=BLEKK)

    tegn.text((BREDDE - MARG, sy + 26), "SONISK KUNST", font=font(26, True),
              fill=BLEKK, anchor="ra")
    tegn.text((BREDDE - MARG, sy + 60), "serie · 1 spor, 3 satser",
              font=font(22), fill=DEMPET, anchor="ra")
    tegn.text((BREDDE - MARG, sy + 92), "trykkeklart ark · ikke opplag",
              font=font(20), fill=(84, 80, 76), anchor="ra")

    ark.save(ut, quality=95)
    return ut


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("audio", nargs="?", help="WAV-fil. Utelates: syntetisk demospor.")
    ap.add_argument("--kilde", help="Mappe med sonisk_kunst-motoren")
    ap.add_argument("--ut", default="figurer/sonisk-kunst-serie.png")
    args = ap.parse_args()

    kilde = finn_kilde(args.kilde)
    sys.path.insert(0, str(kilde))
    from sonisk_kunst.dsp import analyze          # noqa: E402
    from sonisk_kunst.engines.mandala import render_mandala  # noqa: E402

    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        spor = (pathlib.Path(args.audio) if args.audio
                else lag_demospor(tmp / "serie.wav"))
        print(f"kilde  : {kilde}")
        print(f"spor   : {spor}")

        hel = analyze(str(spor))
        # Frøet må utledes av innholdet, ikke av filnavnet eller av hash(),
        # som randomiseres per Python-prosess. En trykkbestilling skal kunne
        # kjøres på nytt om et år og gi nøyaktig samme ark.
        frø = zlib.crc32(spor.read_bytes()) & 0xFFFFFFFF
        meta = {"toneart": hel.key, "tempo_bpm": hel.tempo_bpm,
                "varighet_s": hel.duration, "onsets": len(hel.onsets),
                "frø": f"{frø:08X}"}
        print(f"analyse: {meta['toneart']}, {meta['tempo_bpm']:.0f} BPM, "
              f"{meta['varighet_s']:.0f} s, {meta['onsets']} onsets")

        paneler = []
        for tall, a, b in SATSER:
            bit = klipp_wav(spor, tmp / f"sats_{tall}.wav", a, b)
            feat = analyze(str(bit))
            p = tmp / f"sats_{tall}.png"
            render_mandala(feat, p, size=1400)
            paneler.append(p)
            print(f"  sats {tall:<3}: {feat.key}, {feat.tempo_bpm:.0f} BPM, "
                  f"{len(feat.onsets)} onsets")

        ut = pathlib.Path(args.ut)
        ut.parent.mkdir(parents=True, exist_ok=True)
        komponer(paneler, meta, ut)
        print(f"\nskrev {ut}")


if __name__ == "__main__":
    main()
