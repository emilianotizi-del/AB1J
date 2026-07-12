// Statistiche essenziali: lezioni, parole, carte in scadenza, streak.
import { el } from '../utils/dom.js';
import { getCompleted, getStreak } from '../core/store.js';
import { deckSize, dueCards } from '../core/srs.js';

export function render(mount) {
  mount.innerHTML = '';
  mount.append(el('div', { class: 'screen-head' }, el('h1', {}, 'Statistiche')));

  const cells = [
    [getCompleted().length, 'Lezioni completate'],
    [deckSize(), 'Parole nel mazzo'],
    [dueCards().length, 'Da ripassare ora'],
    [getStreak(), 'Giorni di fila']
  ];
  const grid = el('div', { class: 'stat-grid' });
  for (const [num, lbl] of cells) {
    grid.append(el('div', { class: 'card stat-cell' },
      el('div', { class: 's-num' }, String(num)),
      el('div', { class: 's-lbl' }, lbl)));
  }
  mount.append(grid);
}
