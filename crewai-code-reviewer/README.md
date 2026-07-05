# CrewAI Code Reviewer

En CrewAI-agent som reviewer kode eller diffs og foreslår konkrete fikser —
best practices, potensielle bugs og optimaliseringsmuligheter.

## Oppsett

```bash
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...   # eller nøkkel for annen LLM-leverandør
```

Standardmodell er `openai/gpt-4o-mini`. Overstyr med:

```bash
export CODE_REVIEWER_LLM=openai/gpt-4o
# eller f.eks. Anthropic (krever ANTHROPIC_API_KEY):
export CODE_REVIEWER_LLM=anthropic/claude-sonnet-5
```

## Bruk

```bash
# Review en fil
python crew.py sti/til/fil.py

# Review en diff fra stdin
git diff main | python crew.py -

# Review uncommitted endringer i gjeldende git-repo
python crew.py
```

Resultatet er en strukturert code review: kort oppsummering, deretter funn
sortert etter alvorlighetsgrad med konkrete forslag til fiks.
