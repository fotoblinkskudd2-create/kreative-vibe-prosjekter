"""CLI: python -m sonisk_kunst <fil.wav> [--engine mandala|flowfield|particles|alle]"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .dsp import analyze
from .engines import ENGINES
from .synth import drone_piece


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="sonisk_kunst",
        description="Lyd → algoritmisk kunst. Ren numpy/scipy-pipeline.",
    )
    parser.add_argument("audio", nargs="?", help="WAV-fil (utelat med --demo)")
    parser.add_argument("--engine", default="alle",
                        choices=[*ENGINES, "alle"], help="Kunstmotor")
    parser.add_argument("--out", default="demo", help="Utmappe")
    parser.add_argument("--demo", action="store_true",
                        help="Generer demolyd og visualiser den")
    parser.add_argument("--analyse", action="store_true",
                        help="Skriv kun analyse som JSON, ingen bilder")
    args = parser.parse_args()

    out_dir = Path(args.out)

    if args.demo:
        audio_path = drone_piece(out_dir / "drone_a_moll.wav")
        print(f"♪ Demolyd: {audio_path}")
    elif args.audio:
        audio_path = Path(args.audio)
    else:
        parser.error("Oppgi en WAV-fil eller bruk --demo")

    feat = analyze(audio_path)
    print(f"♪ {audio_path.name}: {feat.duration:.1f}s, {feat.key}, "
          f"{feat.tempo_bpm:.0f} BPM, {len(feat.onsets)} onsets")

    if args.analyse:
        report = {
            "fil": str(audio_path),
            "varighet_s": round(feat.duration, 2),
            "toneart": feat.key,
            "tempo_bpm": round(feat.tempo_bpm, 1),
            "onsets": len(feat.onsets),
            "snitt_energi": round(float(feat.rms.mean()), 4),
            "snitt_centroid_hz": round(float(feat.centroid.mean()), 1),
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return

    engines = ENGINES if args.engine == "alle" else {args.engine: ENGINES[args.engine]}
    for name, render in engines.items():
        out = render(feat, out_dir / f"{audio_path.stem}_{name}.png")
        print(f"✓ {name}: {out}")


if __name__ == "__main__":
    main()
