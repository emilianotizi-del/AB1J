// Scelta multipla. step: { prompt, promptHy?, speakText?, options[], answer, optionsAreHy? }
import { el, shuffle, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  card.append(el('h2', { style: 'text-align:center' }, step.prompt));
  if (step.promptHy) {
    card.append(el('div', {
      class: 'hy-display',
      lang: 'hy',
      style: 'text-align:center;font-size:2.6rem;font-weight:700;margin-top:8px'
    }, step.promptHy));
  }
  if (step.speakText) {
    card.append(el('div', { style: 'text-align:center;margin-top:10px' },
      el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: () => speak(step.speakText) }, '🔊')));
  }

  const opts = el('div', { class: 'options' });
  let answered = false;

  for (const o of shuffle(step.options)) {
    const b = el('button', { class: 'option' + (step.optionsAreHy ? ' hy' : ''), lang: step.optionsAreHy ? 'hy' : 'it' }, o);
    b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const correct = o === step.answer;
      b.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) {
        [...opts.children].find(c => c.textContent === step.answer)?.classList.add('correct');
        vibrate([60, 40, 60]);
      } else {
        vibrate(30);
      }
      const fb = el('div', { class: 'feedback ' + (correct ? 'ok' : 'err') },
        correct ? '✓ Esatto!' : `✗ La risposta giusta è “${step.answer}”`);
      card.append(fb);
      mount.append(el('div', { class: 'lesson-footer' },
        el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(correct) }, 'Avanti')));
    });
    opts.append(b);
  }
  card.append(opts);
  mount.append(card);
}
