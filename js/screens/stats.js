// Statistiche: numeri chiave, attività degli ultimi 7 giorni,
// previsione delle carte in scadenza nei prossimi 7 giorni.
import { el } from '../utils/dom.js';
import { getCompleted, getStreak, getEvents } from '../core/store.js';
import { deckSize, dueCards } from '../core/srs.js';
import { getDeck } from '../core/store.js';

const DAY = 86400000;
const DAY_NAMES = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

function dayKey(d) { return d.toISOString().slice(0, 10); }

function barCard(title, rows, cls = '') {
  const card = el('div', { class: 'card', style: 'margin-top:14px' });
  card.append(el('h2', { style: 'margin-bottom:8px' }, title));
  const max = Math.max(1, ...rows.map(r => r.n));
  for (const r of rows) {
    card.append(el('div', { class: 'bar-row' },
      el('span', { class: 'b-lbl' }, r.label),
      el('div', { class: 'b-track' },
        el('div', { class: 'b-fill ' + cls, style: `width:${Math.round(r.n / max * 100)}%` + (r.n === 0 ? ';opacity:.25' : '') })),
      el('span', { class: 'b-num' }, String(r.n))));
  }
  return card;
}

export function render(mount) {
  mount.innerHTML = '';
  mount.append(el('div', { class: 'screen-head' }, el('h1', {}, 'Statistiche')));

  const cells = [
    [getCompleted().length, 'Lezioni completate'],
    [deckSize(), 'Carte nel mazzo'],
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

  // Attività: risposte + ripassi negli ultimi 7 giorni
  const events = getEvents();
  const activity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY);
    activity.push({
      label: i === 0 ? 'oggi' : DAY_NAMES[d.getDay()],
      n: events[dayKey(d)] || 0
    });
  }
  mount.append(barCard('Esercizi svolti · ultimi 7 giorni', activity));

  // Previsione: carte in scadenza nei prossimi 7 giorni
  const deck = Object.values(getDeck());
  const forecast = [];
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const from = startOfToday.getTime() + i * DAY;
    const to = from + DAY;
    const d = new Date(from);
    forecast.push({
      label: i === 0 ? 'oggi' : DAY_NAMES[d.getDay()],
      n: deck.filter(c => (i === 0 ? c.due < to : c.due >= from && c.due < to)).length
    });
  }
  mount.append(barCard('Carte in arrivo · prossimi 7 giorni', forecast, 'b-blue'));
}
