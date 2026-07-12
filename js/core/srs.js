// Ripetizione dilazionata — SM-2 semplificato.
// Voti: 1 = Di nuovo · 3 = Difficile · 4 = Bene · 5 = Facile
import { getDeck, saveDeck, recordEvent } from './store.js';

const DAY = 86400000;

export function addCards(items) {
  // items: [{ id, hy, tr, ipa, it }]
  const deck = getDeck();
  for (const it of items) {
    if (!deck[it.id]) {
      deck[it.id] = { ...it, ef: 2.5, reps: 0, interval: 0, due: Date.now() };
    }
  }
  saveDeck(deck);
}

export function dueCards(now = Date.now()) {
  return Object.values(getDeck())
    .filter(c => c.due <= now)
    .sort((a, b) => a.due - b.due);
}

export function deckSize() { return Object.keys(getDeck()).length; }

export function grade(cardId, q) {
  const deck = getDeck();
  const c = deck[cardId];
  if (!c) return;
  if (q < 3) {
    c.reps = 0;
    c.interval = 0;
    c.due = Date.now() + 10 * 60 * 1000;          // ripresenta tra 10 minuti
  } else {
    if (c.reps === 0) c.interval = 1;
    else if (c.reps === 1) c.interval = 3;
    else c.interval = Math.round(c.interval * c.ef);
    c.reps += 1;
    c.due = Date.now() + c.interval * DAY;
  }
  c.ef = Math.max(1.3, c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  saveDeck(deck);
  recordEvent();
}
