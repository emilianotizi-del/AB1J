// Ascolto cieco: solo audio, niente testo a schermo finché non rispondi.
// Controlli veri: riascolta, rallenta. La trascrizione si rivela DOPO la risposta.
// step: { speakText, it, question?, options?, answer?, reveal? }
//   - con options+answer: comprensione a scelta multipla (che cosa hai sentito / cosa significa)
//   - senza options: solo ascolto → autovalutazione "ho capito / non ho capito", poi reveal
import { el, shuffle, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card', style: 'text-align:center' });
  card.append(el('h2', {}, step.question || 'Ascolta'));
  card.append(el('p', { style: 'color:var(--ink-soft);font-size:.9rem;margin-top:4px' },
    'Nessun testo: allena l\u2019orecchio. Puoi riascoltare e rallentare.'));

  // Controlli audio
  const controls = el('div', { style: 'display:flex;gap:10px;justify-content:center;margin:18px 0' },
    el('button', { class: 'btn-audio', style: 'width:64px;height:64px;font-size:1.7rem',
      'aria-label': 'Ascolta', onclick: () => speak(step.speakText) }, '🔊'),
    el('button', { class: 'btn-audio', style: 'width:52px;height:52px;font-size:.95rem',
      'aria-label': 'Rallenta', onclick: () => speak(step.speakText, { rate: 0.6 }) }, '0.6×'));
  card.append(controls);
  speak(step.speakText);

  const feedback = el('div', {});
  const revealBox = el('div', {});

  function reveal(ok) {
    revealBox.innerHTML = '';
    revealBox.append(el('div', { class: 'listen-reveal' },
      el('div', { class: 'hy', lang: 'hy', style: 'font-size:1.4rem;font-weight:700' }, step.reveal || step.speakText),
      step.it ? el('div', { style: 'color:var(--ink-soft);margin-top:6px' }, step.it) : null));
    mount.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(ok) }, 'Avanti')));
  }

  if (step.options && step.answer) {
    // Comprensione a scelta multipla
    const opts = el('div', { class: 'options', style: 'margin-top:8px' });
    let answered = false;
    for (const o of shuffle(step.options)) {
      const b = el('button', { class: 'option' + (step.optionsAreHy ? ' hy' : ''), lang: step.optionsAreHy ? 'hy' : 'it' }, o);
      b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const ok = o === step.answer;
        b.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) [...opts.children].find(x => x.textContent === step.answer)?.classList.add('correct');
        vibrate(ok ? 30 : [60, 40, 60]);
        feedback.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'err') }, ok ? '✓ Esatto!' : '✗'));
        reveal(ok);
      });
      opts.append(b);
    }
    card.append(opts, feedback, revealBox);
  } else {
    // Solo ascolto + autovalutazione onesta
    card.append(el('div', { style: 'display:grid;gap:10px;margin-top:8px' },
      el('button', { class: 'btn btn-block', onclick: () => { reveal(true); showResult(); } }, 'Ho capito — mostra il testo'),
      el('button', { class: 'btn btn-secondary btn-block', onclick: () => { reveal(false); showResult(); } }, 'Non ho capito — mostra il testo')),
      feedback, revealBox);
  }
  function showResult() { card.querySelectorAll('.btn, .btn-secondary').forEach(b => b.disabled = true); }

  mount.append(card);
}
