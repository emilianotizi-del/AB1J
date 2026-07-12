// Sintesi vocale (Web Speech API). Interfaccia pensata per accogliere in futuro
// file audio preregistrati e un PronunciationProvider con riconoscimento vocale.
//
// Nota piattaforme: iOS non include alcuna voce armena di sistema, quindi su
// iPhone/iPad la sintesi non è disponibile; su Android la voce va installata
// nelle impostazioni di sistema. In assenza di voce, speak() non pronuncia
// nulla (evita la lettura dell'armeno con una voce sbagliata) e mostra un
// avviso una sola volta per sessione.
let hyVoice = null;
let warned = false;

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
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad con "Richiedi sito desktop"
}

export function hasArmenianVoice() { return !!hyVoice; }

// Testo di aiuto adatto alla piattaforma corrente.
export function voiceHelp() {
  if (isIOS()) {
    return 'iOS non include una voce armena di sistema, quindi per ora l\u2019audio ' +
      'non è disponibile su iPhone e iPad. Stiamo preparando file audio registrati, ' +
      'che funzioneranno su qualunque dispositivo, anche offline.';
  }
  return 'Su questo dispositivo manca una voce armena per la sintesi vocale. ' +
    'Su Android: Impostazioni → Sistema → Lingua → Output sintesi vocale → ' +
    'installa la lingua armena, poi riapri l\u2019app.';
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

export function speak(text) {
  if (!('speechSynthesis' in window)) return false;
  if (!hyVoice) pickVoice();          // le voci possono arrivare in ritardo
  if (!hyVoice) {
    if (!warned) { warned = true; toast('🔇 ' + voiceHelp()); }
    return false;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'hy-AM';
  u.voice = hyVoice;
  u.rate = 0.85;
  speechSynthesis.speak(u);
  return true;
}
