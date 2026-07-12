// Abbinamento a coppie (tocca a sinistra, poi a destra).
// step: { prompt, pairs: [[hy, it], ...] }
import { el, shuffle, vibrate } from '../utils/dom.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  card.append(el('h2', { style: 'text-align:center' }, step.prompt || 'Abbina le coppie'));

  const left = shuffle(step.pairs.map(p => p[0]));
  const right = shuffle(step.pairs.map(p => p[1]));
  const map = new Map(step.pairs);

  const grid = el('div', {
    class: 'options',
    style: 'grid-template-columns:1fr 1fr'
  });

  let selLeft = null;
  let solved = 0;
  let errors = 0;

  const leftBtns = left.map(v => el('button', { class: 'option hy', lang: 'hy' }, v));
  const rightBtns = right.map(v => el('button', { class: 'option' }, v));

  leftBtns.forEach(b => b.addEventListener('click', () => {
    if (b.disabled) return;
    leftBtns.forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    selLeft = b;
  }));

  rightBtns.forEach(b => b.addEventListener('click', () => {
    if (b.disabled || !selLeft) return;
    const ok = map.get(selLeft.textContent) === b.textContent;
    if (ok) {
      vibrate(20);
      selLeft.classList.remove('selected');
      selLeft.classList.add('correct');
      b.classList.add('correct');
      selLeft.disabled = b.disabled = true;
      selLeft = null;
      solved++;
      if (solved === step.pairs.length) {
        mount.append(el('div', { class: 'lesson-footer' },
          el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(errors === 0) }, 'Avanti')));
      }
    } else {
      errors++;
      vibrate([60, 40, 60]);
      b.classList.add('wrong');
      setTimeout(() => b.classList.remove('wrong'), 500);
    }
  }));

  // Colonne intercalate per la griglia 2×N
  for (let i = 0; i < leftBtns.length; i++) {
    grid.append(leftBtns[i], rightBtns[i]);
  }
  card.append(grid);
  mount.append(card);
}
