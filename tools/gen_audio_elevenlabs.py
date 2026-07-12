#!/usr/bin/env python3
"""Rigenera le tracce audio del corso con ElevenLabs (TTS neurale).

Eseguito dalla GitHub Action .github/workflows/audio.yml.
- Raccoglie tutti i testi da alfabeto e lezioni (stessa logica di gen_audio.js).
- Riusa i nomi file di data/hy/audio/index.json: le tracce esistenti vengono
  sovrascritte in qualità neurale, le nuove aggiunte in coda.
- Env: ELEVENLABS_API_KEY (obbligatoria), ELEVENLABS_VOICE_ID (opzionale),
  FORCE=1 per rigenerare anche le tracce già presenti.
"""
import json, os, pathlib, sys, time, urllib.request

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
if not API_KEY:
    sys.exit("ERRORE: il secret ELEVENLABS_API_KEY non è impostato nel repository "
             "(Settings → Secrets and variables → Actions).")
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel
MODELS = ["eleven_v3", "eleven_multilingual_v2"]  # v3 supporta l'armeno; fallback
FORCE = os.environ.get("FORCE") == "1"

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "data/hy/audio"
AUDIO.mkdir(parents=True, exist_ok=True)
IDX = AUDIO / "index.json"

def collect_texts():
    texts = set()
    alpha = json.loads((ROOT / "data/hy/alphabet.json").read_text())
    texts.update(l["lower"] for l in alpha["letters"])
    texts.update(d["lower"] for d in alpha.get("digraphs", []))
    course = json.loads((ROOT / "data/hy/course.json").read_text())
    for mod in course["modules"]:
        for les in mod["lessons"]:
            L = json.loads((ROOT / f"data/hy/lessons/{les['id']}.json").read_text())
            texts.update(w["hy"] for w in L.get("vocab", []))
            for s in L["steps"]:
                if s.get("type") == "teach" and s.get("word"):
                    texts.add(s["word"]["hy"])
                if s.get("speakText"):
                    texts.add(s["speakText"])
    return texts

def tts(text):
    last_err = None
    for model in MODELS:
        body = json.dumps({
            "text": text,
            "model_id": model,
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.8},
        }).encode()
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_22050_32",
            data=body,
            headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last_err = f"{model}: HTTP {e.code} {e.read()[:500].decode(errors='replace')}"
    raise RuntimeError(f"TTS fallita per {text!r}: {last_err}")

def main():
    index = json.loads(IDX.read_text()) if IDX.exists() else {}
    n = len(index)
    changed = 0
    for text in sorted(collect_texts()):
        file = index.get(text)
        if not file:
            n += 1
            file = f"w{n:03d}.mp3"
            index[text] = file
        path = AUDIO / file
        if path.exists() and not FORCE and path.stat().st_size > 0 and index.get("_engine") == "elevenlabs":
            continue
        audio = tts(text)
        path.write_bytes(audio)
        changed += 1
        print(f"{file} ← {text} ({len(audio)} B)")
        time.sleep(0.5)  # cortesia verso l'API
    index["_engine"] = "elevenlabs"
    IDX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"\n{changed} tracce generate/aggiornate, {len(index)-1} totali")

if __name__ == "__main__":
    main()
