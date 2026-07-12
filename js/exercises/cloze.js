// Cloze: frase con una lacuna, opzioni tra cui scegliere.
// step: { it?, text: "Մենք հայերեն ___ սովորում", options: [...], answer, speakText? }
import { el, shuffle, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  card.append(el('h2', { style: 'text-align:center' }, 'Completa la frase'));
  if (step.it) card.append(el('p', { style: 'text-align:center;color:var(--ink-soft);margin-top:6px' }, `«${step.it}»`));

  const gap = el('span', { class: 'cloze-gap' }, '‒‒‒');
  const [before, after] = step.text.split('___');
  const sentence = el('div', { class: 'cloze-text hy', lang: 'hy' }, before, gap, after);
  card.append(sentence);

  let chosen = null;
  const opts = el('div', { class: 'options', style: 'grid-template-columns:repeat(auto-fit,minmax(90px,1fr))' });
  const checkBtn = el('button', { class: 'btn btn-block', style: 'margin-top:16px', disabled: '', onclick: check }, 'Verifica');

  for (const o of shuffle(step.options)) {
    const b = el('button', { class: 'option hy', lang: 'hy' }, o);
    b.addEventListener('click', () => {
      if (done) return;
      [...opts.children].forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      chosen = o;
      gap.textContent = o;
      gap.classList.add('cloze-filled');
      checkBtn.disabled = false;
    });
    opts.append(b);
  }
  card.append(opts, checkBtn);
  mount.append(card);

  let done = false;
  function check() {
    if (done || !chosen) return;
    done = true;
    const ok = chosen === step.answer;
    gap.classList.add(ok ? 'cloze-ok' : 'cloze-err');
    [...opts.children].forEach(x => { x.disabled = true; });
    checkBtn.remove();
    vibrate(ok ? 30 : [60, 40, 60]);
    card.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'err') },
      ok ? '✓ Esatto!' : `✗ La forma giusta è «${step.answer}»`));
    if (!ok) gap.textContent = step.answer;
    if (step.speakText) speak(step.speakText);
    mount.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(ok) }, 'Avanti')));
  }
}
