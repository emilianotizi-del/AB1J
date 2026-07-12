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
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID") or None  # se assente: prima voce dell'account
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


VOWELS = {"ա", "ե", "է", "ը", "ի", "օ", "ու"}
SPECIAL = {"ւ": "վը"}  # hyun: da sola non è pronunciabile, il suono è [v]

def speak_variants(text):
    """Varianti da provare in ordine: la prima che produce audio vince.
    Le lettere singole spesso restituiscono audio vuoto: per le consonanti si
    aggiunge la vocale neutra ը (è la pronuncia didattica standard: b→bə),
    per le vocali si aggiunge il punto armeno ։ come contesto."""
    if len(text) == 1 or text == "ու":
        base = SPECIAL.get(text, text)
        if text in VOWELS:
            return [base + "։", base + ".", base * 2]
        return [base + "ը։", base + "ը"]
    return [text, text + "։"]

def pick_voice():
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/voices",
        headers={"xi-api-key": API_KEY},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        voices = json.load(r).get("voices", [])
    if not voices:
        sys.exit("Nessuna voce disponibile nell'account ElevenLabs.")
    print("Voci disponibili:", ", ".join(f"{v['name']} ({v['voice_id']})" for v in voices[:8]))
    v = voices[0]
    print(f"Voce scelta: {v['name']} ({v['voice_id']}) — per cambiarla, imposta la variabile "
          "di repository ELEVENLABS_VOICE_ID")
    return v["voice_id"]

def tts(text):
    errs = []
    for attempt in range(3):
        for variant in speak_variants(text):
            audio = _tts_once(variant, errs)
            if audio and len(audio) > 500:
                return audio
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"TTS senza audio per {text!r}: " + (" | ".join(errs) or "risposte vuote"))

def _tts_once(text, errs):
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
                audio = r.read()
            if len(audio) > 500:
                return audio
            errs.append(f"{model}: risposta vuota ({len(audio)} B) per {text!r}")
        except urllib.error.HTTPError as e:
            errs.append(f"{model}: HTTP {e.code} {e.read()[:300].decode(errors='replace')}")
    return None

def main():
    global VOICE_ID
    if not VOICE_ID:
        VOICE_ID = pick_voice()
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

# rev 3
