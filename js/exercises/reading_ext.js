// Lettura estensiva con glossa a tocco.
//
// Testi lunghi in cui le parole nuove NON entrano nel ripasso: si toccano per
// vedere la traduzione e si va avanti. Una parola entra nell'SRS solo dopo che
// l'hai cercata PROMOTE_AFTER volte in letture diverse — la promozione la decide
// il tuo comportamento, non una scelta fatta a tavolino.
//
// step: {
//   title, text (armeno continuo),
//   gloss: { "forma": "traduzione", ... }   // chiavi = forme come compaiono nel testo
//   it?                                     // traduzione integrale, a fondo pagina
// }
import { el, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';
import { addCards } from '../core/srs.js';
import { getTapCounts, bumpTap } from '../core/store.js';

// Quante consultazioni prima che la parola diventi una carta.
// 3 = "non è un inciampo isolato, questa parola mi serve davvero".
const PROMOTE_AFTER = 3;

// Punteggiatura armena interna alla parola: va tolta per riconoscere la forma,
// ma resta visibile nel testo. Vedi REVISIONE_lacune_curriculum.md §6.
const INTRAWORD = /[\u055E\u055B\u055C]/g;
const clean = w => w.replace(INTRAWORD, '').toLowerCase();

export function render(step, mount, ctx) {
  const gloss = step.gloss || {};
  const taps = getTapCounts();
  const promoted = new Set();

  const wrap = el('div', {});
  const card = el('div', { class: 'card' });
  card.append(el('div', { class: 'reading-badge' }, '📖 Lettura estesa'));
  if (step.title) card.append(el('h2', { class: 'reading-title hy', lang: 'hy' }, step.title));
  card.append(el('p', { class: 'rx-help' },
    'Tocca una parola che non conosci per vederne il significato. Le parole che cerchi più volte entrano da sole nel ripasso.'));

  // --- testo cliccabile -----------------------------------------------------
  const body = el('div', { class: 'reading-text rx-text hy', lang: 'hy' });
  // Spezzo mantenendo la punteggiatura attaccata al token, così il testo resta
  // identico all'originale anche visivamente.
  for (const tok of step.text.split(/(\s+)/)) {
    if (/^\s+$/.test(tok)) { body.append(document.createTextNode(tok)); continue; }
    const bare = clean(tok.replace(/[։,«»՝]/g, ''));
    const known = gloss[bare];
    if (!known) { body.append(document.createTextNode(tok)); continue; }
    body.append(el('span', {
      class: 'rx-word', role: 'button', tabindex: '0',
      'data-w': bare,
      onclick: e => showGloss(bare, e.currentTarget),
      onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showGloss(bare, e.currentTarget); } }
    }, tok));
  }
  card.append(body);

  // --- pannello della glossa ------------------------------------------------
  const sheet = el('div', { class: 'rx-sheet', hidden: true });
  card.append(sheet);

  function showGloss(w, node) {
    const n = bumpTap(w);
    vibrate(8);
    document.querySelectorAll('.rx-word.is-open').forEach(x => x.classList.remove('is-open'));
    node.classList.add('is-open');
    node.classList.add('is-seen');

    sheet.hidden = false;
    sheet.innerHTML = '';
    sheet.append(
      el('div', { class: 'rx-sheet-head' },
        el('span', { class: 'hy', lang: 'hy' }, w),
        el('button', {
          class: 'btn-audio rx-say', 'aria-label': 'Ascolta',
          onclick: () => speak(w)
        }, '🔊')),
      el('div', { class: 'rx-sheet-it' }, gloss[w])
    );

    if (n >= PROMOTE_AFTER && !promoted.has(w)) {
      promoted.add(w);
      addCards([{ id: `rx:${w}`, hy: w, it: gloss[w] }]);
      sheet.append(el('div', { class: 'rx-promoted' },
        `↗ Cercata ${n} volte: da ora è nel ripasso.`));
    } else if (n < PROMOTE_AFTER) {
      const left = PROMOTE_AFTER - n;
      sheet.append(el('div', { class: 'rx-progress' },
        left === 1 ? 'Ancora una consultazione ed entra nel ripasso.'
                   : `Cercata ${n} volta${n > 1 ? 'e' : ''}.`));
    }
  }

  // Parole già consultate in letture precedenti: segnate, così vedi il tuo storico.
  for (const node of body.querySelectorAll('.rx-word')) {
    if (taps[node.dataset.w]) node.classList.add('is-seen');
  }

  // --- traduzione integrale, in fondo e chiusa ------------------------------
  if (step.it) {
    card.append(el('details', { class: 'reading-recall', style: 'margin-top:16px' },
      el('summary', {}, 'Traduzione integrale (solo dopo aver letto)'),
      el('p', { style: 'margin-top:8px;color:var(--ink-soft)' }, step.it)));
  }

  card.append(el('button', {
    class: 'btn btn-block', style: 'margin-top:16px',
    onclick: () => ctx.onDone(true)
  }, 'Ho finito di leggere'));

  wrap.append(card);
  mount.append(wrap);
}
