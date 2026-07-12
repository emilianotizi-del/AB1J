#!/usr/bin/env python3
"""Audita le tracce audio: durata proporzionata alla lunghezza del testo.
Uso: python3 tools/audit_audio.py [--delete]  (--delete elimina le difettose,
che la GitHub Action rigenererà al push successivo)."""
import json, re, subprocess, sys, os

MIN_ABS = 0.35          # durata minima assoluta (s)
PER_CHAR = 0.07         # durata minima per carattere (s)

idx = json.load(open('data/hy/audio/index.json'))
bad = []
for t, f in idx.items():
    if t == '_engine':
        continue
    path = 'data/hy/audio/' + f
    dur = 0.0
    if os.path.exists(path):
        r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', path], capture_output=True, text=True)
        try:
            dur = float(r.stdout.strip())
        except ValueError:
            pass
    clean = re.sub(r"[՞՜՛։,.\s]", "", t)
    floor = 0.28 if len(clean) <= 1 else MIN_ABS
    if dur < max(floor, PER_CHAR * len(clean)):
        bad.append((t, f, dur))

print(f"tracce: {sum(1 for k in idx if k != '_engine')} | difettose: {len(bad)}")
for t, f, d in sorted(bad, key=lambda x: x[2]):
    print(f"  {f}  {d:.2f}s  ← {t}")
if '--delete' in sys.argv:
    for _, f, _ in bad:
        p = 'data/hy/audio/' + f
        if os.path.exists(p):
            os.remove(p)
    print(f"{len(bad)} file eliminati: verranno rigenerati dall'Action.")
sys.exit(1 if bad else 0)
