// Sintesi vocale (Web Speech API). Interfaccia pensata per accogliere in futuro
// un PronunciationProvider con riconoscimento vocale, senza toccare il resto.
let hyVoice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  hyVoice = voices.find(v => v.lang.toLowerCase().startsWith('hy')) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'hy-AM';
  if (hyVoice) u.voice = hyVoice;
  u.rate = 0.85;
  speechSynthesis.speak(u);
  return true;
}

export function hasArmenianVoice() { return !!hyVoice; }
