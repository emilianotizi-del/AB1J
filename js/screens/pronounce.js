// Allenamento di pronuncia sulle parole del mazzo.
// Con riconoscimento vocale (dove il dispositivo supporta hy-AM): parli,
// confrontiamo col bersaglio e diamo un punteggio.
// Altrimenti, modalità eco: ascolti, ripeti ad alta voce, ti autovaluti.
import { el, shuffle, wordBlock, vibrate } from '../utils/dom.js';
import { getDeck } from '../core/store.js';
import { speak } from '../core/audio.js';
import { available, recognize, similarity } from '../core/pronunciation.js';

const PASS = 0.65;
let echoMode = false;   // diventa vera se il riconoscimento fallisce per lingua non supportata

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

    if (!echoMode && available()) {
      const mic = el('button', { class: 'mic-btn', 'aria-label': 'Parla ora' }, '🎙️');
      mic.addEventListener('click', async () => {
        status.textContent = 'Ti ascolto… pronuncia la parola';
        mic.classList.add('mic-live');
        result.innerHTML = '';
        try {
          const alts = await recognize('hy-AM');
          const best = Math.max(...alts.map(t => similarity(t, card.hy)));
          const ok = best >= PASS;
          vibrate(ok ? 30 : [60, 40, 60]);
          status.textContent = '';
          result.innerHTML = '';
          result.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'err') },
            ok ? `✓ Ottimo! (${Math.round(best * 100)}%)` : `✗ Ho capito «${alts[0]}» — riprova`));
        } catch (e) {
          if (e.message === 'not-allowed') {
            status.textContent = 'Permesso microfono negato: consentilo nelle impostazioni del browser.';
          } else if (e.message === 'language-not-supported' || e.message === 'service-not-allowed') {
            echoMode = true;
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
      // Modalità eco: ascolta → ripeti → autovaluta
      face.append(el('p', { class: 'teach-note' },
        'Questo dispositivo non riconosce il parlato armeno. Modalità eco: ascolta, ripeti ad alta voce, poi valuta tu.'));
      actions.append(
        el('button', { class: 'btn btn-accent btn-block', onclick: () => speak(card.hy) }, '🔊 Riascolta'),
        el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' },
          el('button', { class: 'btn btn-secondary', onclick: () => speak(card.hy) }, 'Ancora una volta'),
          el('button', { class: 'btn', onclick: () => { idx++; show(); } }, 'Mi suona bene →')));
    }

    holder.append(face, actions);
    speak(card.hy);
  }

  show();
}
