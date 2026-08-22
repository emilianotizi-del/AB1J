// Lettura con test di comprensione: testo armeno continuo + domande a scelta multipla.
// step: {
//   title, text (armeno), it? (traduzione, mostrata solo dopo il test o mai),
//   qLang: 'it' | 'hy',   // lingua delle domande
//   questions: [ { q, options:[{text,ok}] } ]
// }
import { el, shuffle, vibrate } from '../utils/dom.js';

// Il punto fermo armeno è ։ (U+0589). Il «.» nei nostri testi introduce il
// discorso diretto («Նա ասաց. «...»») e non chiude la frase: non va usato per dividere.
function splitHy(t) {
  return t.split(/(?<=։)\s+/).map(x => x.trim()).filter(Boolean);
}
// In italiano divido dopo . ! ? eventualmente seguiti da virgolette di chiusura,
// così «Quanto costa?». resta una frase sola.
function splitIt(t) {
  return t.split(/(?<=[.!?]["»']?)\s+/).map(x => x.trim()).filter(Boolean);
}

export function render(step, mount, ctx) {
  let phase = 'read';
  const wrap = el('div', {});
  mount.append(wrap);

  function renderRead() {
    wrap.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.append(el('div', { class: 'reading-badge' }, '📖 Lettura'));
    if (step.title) card.append(el('h2', { class: 'reading-title hy', lang: 'hy' }, step.title));
    // Testo armeno, ariose per la lettura
    card.append(el('div', { class: 'reading-text hy', lang: 'hy' }, step.text));
    // Parole nuove: consultabili se non le deduci dal contesto (ma chiuse di default)
    if (step.newWords?.length) {
      const help = el('details', { class: 'reading-recall', style: 'margin-top:12px' },
        el('summary', {}, 'Parole nuove (prova prima a indovinarle)'));
      const list = el('div', { style: 'margin-top:8px' });
      for (const w of step.newWords) {
        list.append(el('div', { class: 'reading-nw' },
          el('span', { class: 'hy', lang: 'hy', style: 'font-weight:700' }, w.hy),
          el('span', { style: 'color:var(--ink-soft)' }, ' — ' + w.it)));
      }
      help.append(list);
      card.append(help);
    }
    card.append(el('button', { class: 'btn btn-block', style: 'margin-top:16px',
      onclick: () => { phase = 'test'; renderTest(); } }, 'Ho letto → domande'));
    wrap.append(card);
  }

  function renderTest() {
    wrap.innerHTML = '';
    let idx = 0, correct = 0;
    const answers = [];

    function question() {
      const q = step.questions[idx];
      const card = el('div', { class: 'card' });
      card.append(el('div', { class: 'reading-qprog' }, `Domanda ${idx + 1} / ${step.questions.length}`));
      // Ripropongo il testo in piccolo, consultabile
      card.append(el('details', { class: 'reading-recall' },
        el('summary', {}, 'Rivedi il testo'),
        el('div', { class: 'hy', lang: 'hy', style: 'margin-top:8px;line-height:1.7' }, step.text)));
      card.append(el('p', { class: 'reading-q' + (step.qLang === 'hy' ? ' hy' : ''), lang: step.qLang === 'hy' ? 'hy' : 'it' }, q.q));

      const opts = el('div', { style: 'display:grid;gap:10px;margin-top:10px' });
      let answered = false;
      for (const o of shuffle(q.options.slice())) {
        const b = el('button', { class: 'reading-opt' + (step.qLang === 'hy' ? ' hy' : ''), lang: step.qLang === 'hy' ? 'hy' : 'it' }, o.text);
        b.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          if (o.ok) { b.classList.add('opt-ok'); correct++; vibrate(20); }
          else { b.classList.add('opt-no'); vibrate([40, 30, 40]); }
          // se sbagliata, evidenzio anche la risposta corretta
          if (!o.ok) {
            for (const child of opts.children) {
              if (child.textContent === q.options.find(x => x.ok).text) child.classList.add('opt-ok');
            }
          }
          card.append(el('button', { class: 'btn btn-block', style: 'margin-top:14px', onclick: () => {
            idx++;
            if (idx >= step.questions.length) done();
            else { wrap.innerHTML = ''; question(); }
          } }, idx + 1 >= step.questions.length ? 'Risultato' : 'Prossima →'));
        });
        opts.append(b);
      }
      card.append(opts);
      wrap.innerHTML = '';
      wrap.append(card);
    }

    function done() {
      wrap.innerHTML = '';
      const pass = correct >= Math.ceil(step.questions.length * 0.75);
      const card = el('div', { class: 'card', style: 'text-align:center' });
      card.append(
        el('div', { style: 'font-size:2.4rem' }, pass ? '🏆' : '💪'),
        el('h2', {}, `${correct} / ${step.questions.length}`),
        el('p', { style: 'color:var(--ink-soft)' }, pass ? 'Hai capito il testo!' : 'Rileggi con calma e riprova.'));
      // Riepilogo parole nuove (che finiscono nel ripasso)
      if (step.newWords?.length) {
        const box = el('div', { class: 'reading-newwords' },
          el('div', { style: 'font-weight:700;margin-bottom:8px' }, '📚 Parole nuove di questa lettura'));
        for (const w of step.newWords) {
          box.append(el('div', { class: 'reading-nw' },
            el('span', { class: 'hy', lang: 'hy', style: 'font-weight:700' }, w.hy),
            el('span', { style: 'color:var(--ink-soft)' }, ' — ' + w.it)));
        }
        box.append(el('div', { style: 'font-size:.82rem;color:var(--ink-soft);margin-top:8px' },
          'Le trovi da ora nel Ripasso.'));
        card.append(box);
      }
      // Testo originale + traduzione, appaiati frase per frase: dopo le domande
      // serve poter confrontare, non solo rileggere l'italiano.
      if (step.it) {
        const box = el('div', { style: 'margin-top:8px' });
        const hy = splitHy(step.text);
        const it = splitIt(step.it);
        if (hy.length === it.length && hy.length > 1) {
          for (let i = 0; i < hy.length; i++) {
            box.append(el('div', { class: 'bilingual-row' },
              el('div', { class: 'hy', lang: 'hy' }, hy[i]),
              el('div', { class: 'bilingual-it' }, it[i])));
          }
        } else {
          // Se le frasi non si corrispondono una a una, meglio due blocchi
          // che un allineamento sbagliato.
          box.append(
            el('p', { class: 'hy', lang: 'hy', style: 'line-height:1.9' }, step.text),
            el('p', { class: 'bilingual-it', style: 'margin-top:10px' }, step.it));
        }
        card.append(el('details', { class: 'reading-recall', style: 'margin-top:14px;text-align:left' },
          el('summary', {}, 'Testo e traduzione'), box));
      }
      card.append(el('div', { class: 'lesson-footer' },
        el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true, pass ? 0 : 1) }, 'Fine')));
      wrap.append(card);
    }

    question();
  }

  renderRead();
}
