// Audio del corso.
// Priorità: 1) file mp3 preregistrati nel repository (funzionano ovunque,
// anche offline e su iOS) → 2) sintesi vocale di sistema, se esiste una voce
// armena → 3) avviso all'utente, una volta per sessione.
// L'interfaccia resta un'unica funzione speak(text): il resto dell'app non
// conosce la sorgente. In futuro qui si innesterà anche il riconoscimento
// vocale (PronunciationProvider).

const AUDIO_BASE = 'data/hy/audio/';
let index = null;               // mappa testo → file, caricata al primo uso
let indexLoading = null;
let hyVoice = null;
let warned = false;
let player = null;

function loadIndex() {
  if (!indexLoading) {
    indexLoading = fetch(AUDIO_BASE + 'index.json')
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then(j => { index = j; return j; });
  }
  return indexLoading;
}
loadIndex();

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  hyVoice = voices.find(v => v.lang.toLowerCase().startsWith('hy')) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function hasArmenianVoice() { return !!hyVoice; }

export function voiceHelp() {
  return 'Per questa parola manca la traccia audio e il dispositivo non ha ' +
    'una voce armena di sistema' +
    (isIOS() ? ' (iOS non ne include una).' : '.');
}

function toast(msg) {
  const t = document.createElement('div');
  t.setAttribute('role', 'status');
  t.style.cssText =
    'position:fixed;left:16px;right:16px;bottom:calc(90px + env(safe-area-inset-bottom,0px));' +
    'z-index:200;background:var(--ink);color:var(--paper);padding:12px 16px;' +
    'border-radius:12px;font-size:.9rem;box-shadow:var(--shadow)';
  t.textContent = msg;
  document.body.append(t);
  setTimeout(() => t.remove(), 6000);
}

function speakTTS(text) {
  if (!('speechSynthesis' in window)) return false;
  if (!hyVoice) pickVoice();
  if (!hyVoice) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'hy-AM';
  u.voice = hyVoice;
  u.rate = 0.85;
  speechSynthesis.speak(u);
  return true;
}

export async function speak(text) {
  const idx = index || await loadIndex();
  const file = idx[text];
  if (file) {
    try {
      if (player) player.pause();
      player = new Audio(AUDIO_BASE + file);
      await player.play();
      return true;
    } catch { /* riproduzione negata o file mancante: si passa alla TTS */ }
  }
  if (speakTTS(text)) return true;
  if (!warned) { warned = true; toast('🔇 ' + voiceHelp()); }
  return false;
}
