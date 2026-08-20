// Lettura con test di comprensione: testo armeno continuo + domande a scelta multipla.
// step: {
//   title, text (armeno), it? (traduzione, mostrata solo dopo il test o mai),
//   qLang: 'it' | 'hy',   // lingua delle domande
//   questions: [ { q, options:[{text,ok}] } ]
// }
import { el, shuffle, vibrate } from '../utils/dom.js';

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
      // Dopo il test mostro la traduzione del testo, come rinforzo
      if (step.it) {
        card.append(el('details', { class: 'reading-recall', style: 'margin-top:14px;text-align:left' },
          el('summary', {}, 'Vedi la traduzione'),
          el('div', { style: 'margin-top:8px;line-height:1.6' }, step.it)));
      }
      card.append(el('div', { class: 'lesson-footer' },
        el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true, pass ? 0 : 1) }, 'Fine')));
      wrap.append(card);
    }

    question();
  }

  renderRead();
}
