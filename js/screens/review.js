// Ripasso SRS. Ogni parola ha due carte separate:
// - lettura (read): fronte in armeno → retro con traslitterazione, IPA e audio
// - significato (mean): fronte in armeno (+audio) → retro con la traduzione
import { el, vibrate } from '../utils/dom.js';
import { dueCards, grade, deckSize } from '../core/srs.js';
import { speak } from '../core/audio.js';

const KIND_LABEL = { read: 'Come si legge?', mean: 'Che cosa significa?', prod: 'Come si dice in armeno?' };

export function render(mount) {
  mount.innerHTML = '';
  mount.append(el('div', { class: 'screen-head' }, el('h1', {}, 'Ripasso')));

  const queue = dueCards();
  if (!queue.length) {
    mount.append(el('div', { class: 'card review-empty' },
      el('div', { class: 'big-glyph', lang: 'hy' }, 'Լ'),
      el('h2', {}, deckSize() ? 'Tutto ripassato!' : 'Il mazzo è vuoto'),
      el('p', {}, deckSize()
        ? 'Torna più tardi: le carte riappariranno al momento giusto.'
        : 'Completa le lezioni per aggiungere parole al ripasso.')));
    return;
  }

  let idx = 0;
  const holder = el('div', {});
  const counter = el('p', { style: 'text-align:center;color:var(--ink-soft);margin-bottom:10px' });
  mount.append(counter, holder);

  function show() {
    if (idx >= queue.length) {
      holder.innerHTML = '';
      holder.append(el('div', { class: 'card review-empty' },
        el('div', { style: 'font-size:3rem' }, '🎉'),
        el('h2', {}, 'Sessione conclusa!'),
        el('p', {}, 'Ottimo lavoro. Le carte torneranno secondo il loro intervallo.')));
      counter.textContent = '';
      updateBadge();
      return;
    }
    const card = queue[idx];
    const kind = card.kind || 'mean';
    counter.textContent = `Carta ${idx + 1} di ${queue.length}`;
    holder.innerHTML = '';

    let flipped = false;
    let prodText = '';
    const face = el('div', { class: 'card flashcard card-' + kind });
    function flip() {
      if (flipped) return;
      flipped = true;
      paint();
      grades.hidden = false;
      if (kind === 'read' || kind === 'prod') speak(card.hy);
    }

    function paint() {
      face.innerHTML = '';
      face.append(el('div', {
        class: 'kind-tag kind-' + kind
      }, (kind === 'read' ? '🔊 ' : kind === 'prod' ? '✍️ ' : '💬 ') + KIND_LABEL[kind]));
      if (kind === 'prod') {
        face.append(el('div', {
          style: 'font-size:1.8rem;font-weight:700;margin-top:6px'
        }, card.it));
      } else {
        face.append(el('div', {
          class: 'w-hy hy-display', lang: 'hy',
          style: 'font-size:2.4rem;font-weight:700;margin-top:6px'
        }, card.hy));
      }
      if (!flipped) {
        if (kind === 'prod') {
          face.append(el('p', { style: 'color:var(--ink-soft);font-size:.9rem;margin-top:14px' },
            'Scrivi in armeno con la tua tastiera, poi tocca «Verifica».'));
          // Vero campo di testo: apre la tastiera di sistema (quella armena di iPhone).
          const input = el('input', {
            type: 'text', lang: 'hy', inputmode: 'text', autocapitalize: 'off',
            autocorrect: 'off', spellcheck: 'false',
            class: 'prod-input hy', placeholder: '…', value: prodText
          });
          input.addEventListener('click', e => e.stopPropagation());
          input.addEventListener('input', () => { prodText = input.value; });
          // Invio da tastiera = verifica
          input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); prodText = input.value; flip(); } });
          const checkBtn = el('button', { class: 'btn btn-block', style: 'margin-top:12px',
            onclick: e => { e.stopPropagation(); prodText = input.value; flip(); } }, 'Verifica');
          face.append(input, checkBtn);
          // Metto il focus per far comparire subito la tastiera
          setTimeout(() => input.focus(), 50);
        } else {
          // Sul fronte della carta di significato l'audio è un indizio lecito;
          // su quella di lettura rivelerebbe la risposta.
          if (kind === 'mean') {
            face.append(el('button', {
              class: 'btn-audio', style: 'margin-top:12px', 'aria-label': 'Ascolta',
              onclick: e => { e.stopPropagation(); speak(card.hy); }
            }, '🔊'));
          }
          face.append(el('p', { style: 'color:var(--ink-soft);font-size:.85rem;margin-top:14px' }, 'Tocca per girare'));
        }
      } else if (kind === 'read') {
        face.append(
          el('div', { class: 'w-tr', style: 'margin-top:10px;font-size:1.2rem' }, card.tr),
          card.ipa ? el('div', { class: 'w-ipa' }, card.ipa) : null,
          el('button', {
            class: 'btn-audio', style: 'margin-top:12px', 'aria-label': 'Ascolta',
            onclick: e => { e.stopPropagation(); speak(card.hy); }
          }, '🔊'));
      } else if (kind === 'prod') {
        // Confronto indulgente (punteggiatura/spazi) tra ciò che hai scritto e la risposta
        const clean = x => String(x).trim().replace(/[։.,՞՜՛?!]/g, '').replace(/\s+/g, ' ').toLowerCase();
        const wrote = prodText.trim();
        const ok = wrote && clean(wrote) === clean(card.hy);
        if (wrote && !ok) {
          // Evidenzio lettera per lettera: verde se combacia con la risposta, rossa se no.
          // Confronto le stringhe "pulite" per allineare le posizioni, ma mostro i caratteri scritti.
          const target = clean(card.hy);
          const typed = clean(wrote);
          const box = el('div', { class: 'feedback err', style: 'margin-top:8px' });
          box.append(el('span', {}, '✗ Hai scritto: '));
          const chars = el('span', { class: 'hy', lang: 'hy', style: 'font-weight:700' });
          for (let i = 0; i < typed.length; i++) {
            const good = typed[i] === target[i];
            chars.append(el('span', { class: good ? 'ch-ok' : 'ch-bad' }, typed[i]));
          }
          box.append(chars);
          face.append(box);
        } else if (wrote && ok) {
          face.append(el('div', { class: 'feedback ok', style: 'margin-top:8px' }, '✓ Esatto!'));
        }
        // Risposta corretta nello STESSO font dell'input (sans), non serif, per confrontare bene
        face.append(
          el('div', { class: 'w-hy hy', lang: 'hy', style: 'font-family:var(--font-hy);font-size:2rem;font-weight:700;margin-top:10px' }, card.hy),
          el('div', { class: 'w-tr', style: 'margin-top:6px' }, card.tr),
          el('button', {
            class: 'btn-audio', style: 'margin-top:12px', 'aria-label': 'Ascolta',
            onclick: e => { e.stopPropagation(); speak(card.hy); }
          }, '🔊'));
      } else {
        // La traduzione qui è LA RISPOSTA della carta, non un aiuto: sempre visibile,
        // indipendente dal setting "Traduzione italiana".
        face.append(el('div', { class: 'w-it-answer', style: 'margin-top:12px;font-size:1.25rem;font-weight:600' }, card.it));
      }
    }
    paint();
    face.addEventListener('click', () => {
      if (kind === 'prod') return;   // la carta prod si gira col bottone «Verifica»
      flip();
    });

    const grades = el('div', { class: 'grade-row', hidden: '' });
    const opts = [[1, 'Di nuovo', 'g-again'], [3, 'Difficile', 'g-hard'], [4, 'Bene', 'g-good'], [5, 'Facile', 'g-easy']];
    for (const [q, label, cls] of opts) {
      grades.append(el('button', {
        class: 'btn ' + cls, onclick: () => { vibrate(15); grade(card.id, q); idx++; show(); }
      }, label));
    }
    grades.hidden = true;

    holder.append(face, grades);
  }

  show();
}

export function updateBadge() {
  const b = document.getElementById('review-badge');
  const n = dueCards().length;
  b.hidden = n === 0;
  b.textContent = n > 99 ? '99+' : n;
}
