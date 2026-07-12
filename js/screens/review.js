// Ripasso SRS. Ogni parola ha due carte separate:
// - lettura (read): fronte in armeno → retro con traslitterazione, IPA e audio
// - significato (mean): fronte in armeno (+audio) → retro con la traduzione
import { el, vibrate } from '../utils/dom.js';
import { dueCards, grade, deckSize } from '../core/srs.js';
import { speak } from '../core/audio.js';

const KIND_LABEL = { read: 'Come si legge?', mean: 'Che cosa significa?' };

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
    const face = el('div', { class: 'card flashcard' });

    function paint() {
      face.innerHTML = '';
      face.append(el('div', {
        style: 'font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft)'
      }, KIND_LABEL[kind]));
      face.append(el('div', {
        class: 'w-hy hy-display', lang: 'hy',
        style: 'font-size:2.4rem;font-weight:700;margin-top:6px'
      }, card.hy));
      if (!flipped) {
        // Sul fronte della carta di significato l'audio è un indizio lecito;
        // su quella di lettura rivelerebbe la risposta.
        if (kind === 'mean') {
          face.append(el('button', {
            class: 'btn-audio', style: 'margin-top:12px', 'aria-label': 'Ascolta',
            onclick: e => { e.stopPropagation(); speak(card.hy); }
          }, '🔊'));
        }
        face.append(el('p', { style: 'color:var(--ink-soft);font-size:.85rem;margin-top:14px' }, 'Tocca per girare'));
      } else if (kind === 'read') {
        face.append(
          el('div', { class: 'w-tr', style: 'margin-top:10px;font-size:1.2rem' }, card.tr),
          card.ipa ? el('div', { class: 'w-ipa' }, card.ipa) : null,
          el('button', {
            class: 'btn-audio', style: 'margin-top:12px', 'aria-label': 'Ascolta',
            onclick: e => { e.stopPropagation(); speak(card.hy); }
          }, '🔊'));
      } else {
        face.append(el('div', { class: 'w-it', style: 'margin-top:12px;font-size:1.25rem;font-weight:600' }, card.it));
      }
    }
    paint();
    face.addEventListener('click', () => {
      if (flipped) return;
      flipped = true;
      paint();
      grades.hidden = false;
      if (kind === 'read') speak(card.hy);
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
