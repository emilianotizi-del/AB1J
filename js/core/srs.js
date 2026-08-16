// Ripetizione dilazionata — SM-2 semplificato.
// Voti: 1 = Di nuovo · 3 = Difficile · 4 = Bene · 5 = Facile
import { getDeck, saveDeck, recordEvent } from './store.js';

const DAY = 86400000;

export function addCards(items) {
  // items: [{ id, hy, tr, ipa, it }]
  // Ogni voce genera DUE carte: lettura (read) e significato (mean),
  // programmate separatamente dall'algoritmo.
  const deck = getDeck();
  for (const it of items) {
    for (const kind of ['read', 'mean', 'prod']) {
      const id = it.id + ':' + kind[0];
      if (!deck[id]) {
        deck[id] = { ...it, id, kind, ef: 2.5, reps: 0, interval: 0, due: Date.now() };
      }
    }
  }
  saveDeck(deck);
}

// Migrazione: le carte create prima dello sdoppiamento diventano due,
// ereditando lo stato di ripasso (nessun progresso perso).
export function migrateDeck() {
  const deck = getDeck();
  let changed = false;
  // 1) Vecchie carte senza kind → read + mean + prod
  for (const [id, c] of Object.entries(deck)) {
    if (!c.kind) {
      delete deck[id];
      for (const kind of ['read', 'mean', 'prod']) {
        const nid = id + ':' + kind[0];
        deck[nid] = { ...c, id: nid, kind };
      }
      changed = true;
    }
  }
  // 2) Parole che hanno read+mean ma non ancora la carta prod (produzione IT→HY)
  const base = {};
  for (const c of Object.values(deck)) {
    if (c.kind) {
      const root = c.id.slice(0, -2);       // toglie ":r"/":m"/":p"
      base[root] = base[root] || c;
    }
  }
  for (const [root, c] of Object.entries(base)) {
    const pid = root + ':p';
    if (!deck[pid]) {
      deck[pid] = { ...c, id: pid, kind: 'prod', ef: 2.5, reps: 0, interval: 0, due: Date.now() };
      changed = true;
    }
  }
  if (changed) saveDeck(deck);
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
