// Allenamento di pronuncia sulle parole del mazzo. Tre modalità, in ordine:
// 1. Scribe (ElevenLabs, con chiave dell'utente nelle Opzioni): registri una
//    clip, la trascrizione viene confrontata col bersaglio. Funziona ovunque.
// 2. Riconoscimento nativo del browser (dove supporta hy-AM, es. Chrome/Android).
// 3. Modalità eco: ascolta, ripeti ad alta voce, autovaluta.
import { el, shuffle, wordBlock, vibrate } from '../utils/dom.js';
import { getDeck, getSettings, recordEvent } from '../core/store.js';
import { speak } from '../core/audio.js';
import { available, recognize, matchScore, recordClip, transcribeScribe } from '../core/pronunciation.js';

const PASS = 0.62;     // ✓ corretto
const NEAR = 0.42;     // ~ quasi: vale la pena riprovare
const CLIP_MS = 6000;
const SHORT = 5;       // parole fino a 5 lettere: si chiede di ripeterle due volte
let nativeBroken = false;   // il riconoscimento nativo ha fallito per lingua non supportata

export function render(mount) {
  mount.innerHTML = '';
  mount.append(el('div', { class: 'screen-head' },
    el('a', { class: 'btn-ghost', href: '#/home', 'aria-label': 'Torna al corso' }, '←'),
    el('h1', {}, 'Pronuncia')));

  const seen = new Set();
  const unique = Object.values(getDeck()).filter(c => !seen.has(c.hy) && seen.add(c.hy));
  const cards = shuffle(unique).slice(0, 10);
  if (!cards.length) {
    mount.append(el('div', { class: 'card review-empty' },
      el('h2', {}, 'Ancora niente da pronunciare'),
      el('p', {}, 'Completa le prime lezioni per riempire il mazzo, poi torna qui.')));
    return;
  }

  let idx = 0;
  const holder = el('div', {});
  const counter = el('p', { style: 'text-align:center;color:var(--ink-soft);margin-bottom:10px' });
  mount.append(counter, holder);

  function mode() {
    if (getSettings().sttKey) return 'scribe';
    if (!nativeBroken && available()) return 'native';
    return 'echo';
  }

  function show() {
    if (idx >= cards.length) {
      holder.innerHTML = '';
      holder.append(el('div', { class: 'card review-empty' },
        el('div', { style: 'font-size:3rem' }, '🎉'),
        el('h2', {}, 'Sessione conclusa!'),
        el('p', {}, 'La pronuncia si costruisce a piccole dosi: torna spesso.')));
      counter.textContent = '';
      return;
    }
    const card = cards[idx];
    counter.textContent = `Parola ${idx + 1} di ${cards.length}`;
    holder.innerHTML = '';

    const face = el('div', { class: 'card', style: 'text-align:center;padding:24px 16px' });
    face.append(wordBlock(card),
      el('div', { style: 'margin-top:12px' },
        el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: () => speak(card.hy) }, '🔊')));

    const status = el('p', { style: 'text-align:center;margin-top:12px;min-height:1.5em;color:var(--ink-soft)' });
    const result = el('div', {});
    const actions = el('div', { style: 'display:grid;gap:10px;margin-top:14px' });
    const m = mode();

    function showResult(transcripts) {
      const best = Math.max(...transcripts.map(t => matchScore(t, card.hy)));
      const heard = (transcripts[0] || '').trim();
      recordEvent();
      status.textContent = '';
      result.innerHTML = '';
      if (best >= PASS) {
        vibrate(30);
        result.append(el('div', { class: 'feedback ok' }, `✓ Ottimo! (${Math.round(best * 100)}%)`));
      } else if (best >= NEAR) {
        vibrate(20);
        result.append(el('div', { class: 'feedback', style: 'background:var(--paper);border:1.5px solid var(--accent);color:var(--accent-ink)' },
          `~ Ci siamo quasi (${Math.round(best * 100)}%)` + (heard ? ` — ho sentito «${heard}»` : '')));
      } else {
        vibrate([60, 40, 60]);
        result.append(el('div', { class: 'feedback err' },
          heard ? `✗ Ho sentito «${heard}»` : '✗ Non ho sentito nulla di chiaro'));
      }
      if (best < PASS) {
        result.append(el('p', { style: 'font-size:.8rem;color:var(--ink-soft);margin-top:8px;text-align:center' },
          'Le parole corte sono difficili da riconoscere: riprova scandendo, o passa avanti — ' +
          'il giudizio della macchina non è la verità.'));
      }
    }

    const isShort = card.hy.replace(/\s/g, '').length <= SHORT;

    if (m === 'scribe') {
      face.append(el('p', { class: 'teach-note', style: 'margin-top:14px' },
        isShort
          ? 'Parola corta: pronunciala DUE VOLTE, con una breve pausa. Il riconoscimento è molto più affidabile.'
          : 'Tocca il microfono e pronuncia la parola.'));
      const mic = el('button', { class: 'mic-btn', 'aria-label': 'Registra' }, '🎙️');
      let stopFn = null;
      let busy = false;
      mic.addEventListener('click', async () => {
        if (busy) return;
        if (stopFn) { stopFn(); return; }        // secondo tocco: ferma la registrazione
        result.innerHTML = '';
        try {
          status.textContent = 'Registro… parla ora (tocca di nuovo per fermare)';
          mic.classList.add('mic-live');
          const { blob, mime } = await recordClip(CLIP_MS, s => { stopFn = s; });
          stopFn = null;
          mic.classList.remove('mic-live');
          busy = true;
          status.textContent = 'Trascrivo…';
          const text = await transcribeScribe(blob, mime, getSettings().sttKey);
          showResult([text]);
        } catch (e) {
          stopFn = null;
          mic.classList.remove('mic-live');
          status.textContent =
            e.message === 'bad-key' ? 'Chiave API non valida: controlla nelle Opzioni.'
            : e.name === 'NotAllowedError' ? 'Permesso microfono negato: consentilo nelle impostazioni del browser.'
            : 'Errore di rete o del servizio: riprova.';
        }
        busy = false;
      });
      face.append(el('div', { style: 'margin-top:18px' }, mic), status, result);
      actions.append(el('button', { class: 'btn btn-secondary btn-block', onclick: () => { idx++; show(); } }, 'Avanti'));
    } else if (m === 'native') {
      const mic = el('button', { class: 'mic-btn', 'aria-label': 'Parla ora' }, '🎙️');
      mic.addEventListener('click', async () => {
        status.textContent = 'Ti ascolto… pronuncia la parola';
        mic.classList.add('mic-live');
        result.innerHTML = '';
        try {
          const alts = await recognize('hy-AM');
          showResult(alts);
        } catch (e) {
          if (e.message === 'not-allowed') {
            status.textContent = 'Permesso microfono negato: consentilo nelle impostazioni del browser.';
          } else if (e.message === 'language-not-supported' || e.message === 'service-not-allowed') {
            nativeBroken = true;
            show();
            return;
          } else {
            status.textContent = 'Non ho sentito nulla: riprova parlando più vicino al microfono.';
          }
        }
        mic.classList.remove('mic-live');
      });
      face.append(el('div', { style: 'margin-top:18px' }, mic), status, result);
      actions.append(el('button', { class: 'btn btn-secondary btn-block', onclick: () => { idx++; show(); } }, 'Avanti'));
    } else {
      face.append(el('p', { class: 'teach-note' },
        'Modalità eco: ascolta, ripeti ad alta voce, poi valuta tu. Suggerimento: con una ' +
        'chiave API ElevenLabs (Opzioni → Riconoscimento vocale) l\u2019app può ascoltarti davvero.'));
      actions.append(
        el('button', { class: 'btn btn-accent btn-block', onclick: () => speak(card.hy) }, '🔊 Riascolta'),
        el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
          el('button', { class: 'btn btn-secondary', onclick: () => speak(card.hy) }, 'Ancora una volta'),
          el('button', { class: 'btn', onclick: () => { idx++; show(); } }, 'Mi suona bene →')));
    }

    holder.append(face, actions);
    // L'audio di riferimento non parte da solo in modalità microfono:
    // finirebbe nella registrazione. Lo si ascolta col pulsante 🔊.
    if (m === 'echo') speak(card.hy);
  }

  show();
}
