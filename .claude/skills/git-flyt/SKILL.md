---
name: git-flyt
description: Ryddig git-arbeidsflyt — små commits med gode meldinger, riktig branch, push med retry. Bruk ved all commit/push-aktivitet.
---

# Git-flyt

## Regler for commits
1. **Én logisk endring per commit** — en bolk sanger, ett bygd prosjekt, én skill.
2. **Meldingsformat**: `<type>: <hva, på norsk>` der type er `feat`, `fix`, `docs`, `innhold`, `oppsett`.
   - Eks: `innhold: sanger 21–30 (black metal, norsk)`
3. **Aldri commit**: API-nøkler, passord, `.env`-filer, node_modules, virtuelle miljøer, filer over 50 MB.
4. Sjekk `git status` og `git diff` FØR du committer — vit hva du legger til.

## Push
- Alltid `git push -u origin <branch>`.
- Ved nettverksfeil: retry med 2s, 4s, 8s, 16s ventetid.
- Aldri force-push uten eksplisitt beskjed.

## Branch
- Jobb alltid på den utpekte arbeidsbranchen, aldri rett på main.
- Nye eksperimenter: `git checkout -b eksperiment/<navn>`.
