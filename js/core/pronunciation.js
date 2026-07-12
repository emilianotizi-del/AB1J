// PronunciationProvider: riconoscimento vocale via Web Speech API.
// Su Chrome/Android il riconoscimento è server-side e supporta l'armeno (hy-AM);
// su iOS Safari usa il riconoscimento di sistema, che l'armeno non lo include:
// in quel caso available() è vera ma il riconoscimento fallisce → la UI ripiega
// sulla modalità eco (ascolta, ripeti, autovaluta).
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function available() { return !!SR; }

export function recognize(lang = 'hy-AM', timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (!SR) return reject(new Error('unsupported'));
    const r = new SR();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 3;
    let settled = false;
    const timer = setTimeout(() => { if (!settled) { settled = true; try { r.abort(); } catch {} reject(new Error('timeout')); } }, timeoutMs);
    r.onresult = e => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      resolve([...e.results[0]].map(a => a.transcript));
    };
    r.onerror = e => { if (!settled) { settled = true; clearTimeout(timer); reject(new Error(e.error || 'error')); } };
    r.onend = () => { if (!settled) { settled = true; clearTimeout(timer); reject(new Error('no-speech')); } };
    r.start();
  });
}

// Normalizzazione e similarità (Levenshtein) per confrontare il riconosciuto col bersaglio.
export function normalize(s) {
  return s.toLowerCase().replace(/[՞՜՛։,.?!\s]/g, '');
}

export function similarity(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a.length || !b.length) return 0;
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - m[a.length][b.length] / Math.max(a.length, b.length);
}
