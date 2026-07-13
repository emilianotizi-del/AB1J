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

// Confronto robusto per il riconoscimento vocale: la trascrizione viene
// spezzata in parole, si cerca la corrispondenza migliore col bersaglio e si
// ignora l'articolo determinativo (-ը/-ն) che il modello spesso aggiunge.
export function stripArticle(w) {
  return w.replace(/[ըն]$/u, '');
}

export function matchScore(transcript, target) {
  // Il bersaglio può essere una parola o una frase; la trascrizione può
  // contenerlo ripetuto (chiediamo la doppia ripetizione sulle parole corte),
  // preceduto/seguito da altro, o con l'articolo aggiunto dal modello.
  // Strategia: si confronta il bersaglio con TUTTE le finestre contigue di
  // parole della trascrizione e si prende la corrispondenza migliore.
  const targetWords = String(target).split(/\s+/u).filter(Boolean).length;
  const t = normalize(target);
  const tStripped = stripArticle(t);
  const tokens = String(transcript).split(/[\s,.;։՞՜՛!?]+/u).filter(Boolean);
  if (!tokens.length) return 0;

  let best = 0;
  const maxWin = Math.min(tokens.length, targetWords + 1);
  for (let win = 1; win <= maxWin; win++) {
    for (let i = 0; i + win <= tokens.length; i++) {
      const chunk = normalize(tokens.slice(i, i + win).join(''));
      const chunkStripped = stripArticle(chunk);
      best = Math.max(
        best,
        similarity(chunk, t),
        similarity(chunkStripped, t),
        similarity(chunk, tStripped),
        similarity(chunkStripped, tStripped)
      );
      if (best === 1) return 1;
    }
  }
  return best;
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

/* ===== Riconoscimento remoto: ElevenLabs Scribe (opzionale, chiave dell'utente) =====
   La chiave vive solo in localStorage sul dispositivo; l'audio va direttamente
   dal browser ad api.elevenlabs.io, mai su altri server. */

export async function recordClip(maxMs = 4000, onStop = null) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
             : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise(resolve => {
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      resolve(new Blob(chunks, { type: rec.mimeType }));
    };
  });
  rec.start();
  const timer = setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, maxMs);
  const stop = () => { clearTimeout(timer); if (rec.state === 'recording') rec.stop(); };
  if (onStop) onStop(stop);
  return { blob: await done, mime: rec.mimeType, stop };
}

export async function transcribeScribe(blob, mime, apiKey) {
  const ext = (mime || '').includes('mp4') ? 'mp4' : 'webm';
  const fd = new FormData();
  fd.append('file', blob, 'clip.' + ext);
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', 'hy');
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: fd
  });
  if (res.status === 401) throw new Error('bad-key');
  if (!res.ok) throw new Error('http-' + res.status);
  const data = await res.json();
  return data.text || '';
}
