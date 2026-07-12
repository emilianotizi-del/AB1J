// Ripasso SRS con flashcard: fronte in armeno, retro con traslitterazione, IPA e italiano.
import { el, wordBlock } from '../utils/dom.js';
import { dueCards, grade, deckSize } from '../core/srs.js';
import { speak } from '../core/audio.js';

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
        el('div', { class: 'done-glyph', style: 'font-size:3rem' }, '🎉'),
        el('h2', {}, 'Sessione conclusa!'),
        el('p', {}, 'Ottimo lavoro. Le carte torneranno secondo il loro intervallo.')));
      counter.textContent = '';
      updateBadge();
      return;
    }
    const card = queue[idx];
    counter.textContent = `Carta ${idx + 1} di ${queue.length}`;
    holder.innerHTML = '';

    let flipped = false;
    const face = el('div', { class: 'card flashcard' });

    function paint() {
      face.innerHTML = '';
      if (!flipped) {
        face.append(
          el('div', { class: 'w-hy hy-display', lang: 'hy', style: 'font-size:2.6rem;font-weight:700' }, card.hy),
          el('p', { style: 'color:var(--ink-soft);font-size:.85rem;margin-top:14px' }, 'Tocca per girare'));
      } else {
        face.append(wordBlock(card));
      }
    }
    paint();
    face.addEventListener('click', () => { flipped = true; paint(); grades.hidden = false; });

    const audioRow = el('div', { style: 'text-align:center;margin-top:12px' },
      el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: e => { e.stopPropagation(); speak(card.hy); } }, '🔊'));

    const grades = el('div', { class: 'grade-row', hidden: '' });
    const opts = [[1, 'Di nuovo', 'g-again'], [3, 'Difficile', 'g-hard'], [4, 'Bene', 'g-good'], [5, 'Facile', 'g-easy']];
    for (const [q, label, cls] of opts) {
      grades.append(el('button', {
        class: 'btn ' + cls, onclick: () => { grade(card.id, q); idx++; show(); }
      }, label));
    }
    grades.hidden = true;

    holder.append(face, audioRow, grades);
  }

  show();
}

export function updateBadge() {
  const b = document.getElementById('review-badge');
  const n = dueCards().length;
  b.hidden = n === 0;
  b.textContent = n > 99 ? '99+' : n;
}
