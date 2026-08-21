// Ripetizione dilazionata — SM-2 semplificato.
// Voti: 1 = Di nuovo · 3 = Difficile · 4 = Bene · 5 = Facile
import { getDeck, saveDeck, recordEvent } from './store.js';

const DAY = 86400000;
const HOUR = 3600000;

// Le tre carte di una parola nuova non devono uscire nella stessa sessione:
// vedere «come si legge», poi «che cosa significa», poi «scrivila» a distanza di
// pochi secondi non misura la memoria, misura l'eco di ciò che hai appena letto.
// Sfalso l'ingresso: prima il riconoscimento, molto dopo la produzione.
const FIRST_DUE = { read: 0, mean: 1 * DAY, prod: 3 * DAY };
// Jitter: evita che tutte le parole di una lezione tornino nello stesso istante
// e quindi nello stesso ordine in cui sono state imparate.
const jitter = () => Math.floor(Math.random() * 8 * HOUR);

export function addCards(items) {
  // items: [{ id, hy, tr, ipa, it }]
  // Ogni voce genera DUE carte: lettura (read) e significato (mean),
  // programmate separatamente dall'algoritmo.
  const deck = getDeck();
  for (const it of items) {
    for (const kind of ['read', 'mean', 'prod']) {
      const id = it.id + ':' + kind[0];
      if (!deck[id]) {
        deck[id] = { ...it, id, kind, ef: 2.5, reps: 0, interval: 0,
                     due: Date.now() + FIRST_DUE[kind] + jitter() };
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

  // 'due' nel recente passato e sfalsato su ~3 giorni: le carte nuove entrano
  // subito nel ripasso, mescolate, senza accodarsi tutte in fondo né in blocco.
  const spread = () => Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000) - 1;

  // 1) Vecchie carte senza kind → read + mean + prod
  for (const [id, c] of Object.entries(deck)) {
    if (c && typeof c === 'object' && !c.kind && c.hy) {
      delete deck[id];
      for (const kind of ['read', 'mean', 'prod']) {
        const nid = id + ':' + kind[0];
        deck[nid] = { ...c, id: nid, kind, due: kind === 'prod' ? spread() : (c.due || Date.now()) };
      }
      changed = true;
    }
  }

  // 2) Parole con read+mean ma senza la carta prod → creala
  const base = {};
  for (const c of Object.values(deck)) {
    if (c && c.kind && c.id) {
      const root = c.id.slice(0, -2);
      base[root] = base[root] || c;
    }
  }
  for (const [root, c] of Object.entries(base)) {
    const pid = root + ':p';
    if (!deck[pid]) {
      deck[pid] = { ...c, id: pid, kind: 'prod', ef: 2.5, reps: 0, interval: 0, due: spread() };
      changed = true;
    }
  }

  // 3) Correzione una-tantum: le carte prod della PRIMA migrazione erano tutte
  //    accodate con due=now (mai ripassate, reps 0). Le sfalso perché entrino in circolo.
  //    Uso un flag nelle impostazioni, non nel mazzo, per non sporcare il deck.
  if (!localStorage.getItem('ab1j_prod_spread_done')) {
    for (const c of Object.values(deck)) {
      if (c && c.kind === 'prod' && c.reps === 0) c.due = spread();
    }
    localStorage.setItem('ab1j_prod_spread_done', '1');
    changed = true;
  }

  // 4) Correzione una-tantum: le carte mai ripassate (reps 0) di una stessa
  //    parola erano tutte scadute nello stesso istante, quindi uscivano in fila
  //    (leggi → traduci → scrivi). Le sfalso secondo FIRST_DUE, senza toccare
  //    nulla di ciò che è già stato ripassato almeno una volta.
  if (!localStorage.getItem('ab1j_kind_stagger_done')) {
    for (const c of Object.values(deck)) {
      if (c && c.reps === 0 && c.kind && FIRST_DUE[c.kind] != null) {
        c.due = Date.now() + FIRST_DUE[c.kind] + jitter();
      }
    }
    localStorage.setItem('ab1j_kind_stagger_done', '1');
    changed = true;
  }

  if (changed) saveDeck(deck);
}

// Radice di una carta: 'l024n:չեմ:r' → 'l024n:չեմ' (la parola), 'l024n' (la lezione).
const rootOf   = c => String(c.id).slice(0, -2);
const lessonOf = c => String(c.id).split(':')[0];

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Allontana le carte che si aiutano a vicenda: due carte della stessa parola,
// o due parole imparate nella stessa lezione (spesso dello stesso campo
// semantico: «qui»/«lì»), non devono capitare una dopo l'altra.
function spaceOut(cards) {
  const out = [];
  const pending = cards.slice();
  while (pending.length) {
    const prev = out[out.length - 1];
    let pick = 0;
    if (prev) {
      const clashes = c => rootOf(c) === rootOf(prev) ||
                           (lessonOf(c) === lessonOf(prev) && pending.length > 2);
      // Cerco la prima carta che non fa attrito; se sono tutte "vicine",
      // tengo l'ordine originale invece di rimescolare all'infinito.
      const found = pending.findIndex(c => !clashes(c));
      if (found > -1) pick = found;
    }
    out.push(pending.splice(pick, 1)[0]);
  }
  return out;
}

export function dueCards(now = Date.now()) {
  const due = Object.values(getDeck()).filter(c => c.due <= now);
  // Priorità a chi è più in ritardo, ma a scaglioni di un giorno: dentro lo
  // stesso scaglione l'ordine è casuale, non quello di inserimento.
  const lateness = c => Math.floor((now - c.due) / DAY);
  const ordered = shuffled(due).sort((a, b) => lateness(b) - lateness(a));
  return spaceOut(ordered);
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
