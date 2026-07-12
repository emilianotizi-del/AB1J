// Lettura: breve testo per frasi, ognuna con audio; traduzione a comparsa.
// step: { title, sentences: [{hy, tr, ipa, it}] }
import { el } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  card.append(el('h2', { style: 'text-align:center;margin-bottom:12px' }, step.title || 'Leggi il testo'));

  let showIt = false;
  const body = el('div', {});
  function paint() {
    body.innerHTML = '';
    for (const s of step.sentences) {
      body.append(el('button', {
        class: 'read-line', 'aria-label': 'Ascolta la frase', onclick: () => speak(s.hy)
      },
        el('div', { class: 'read-hy hy', lang: 'hy' }, s.hy + ' 🔊'),
        s.tr ? el('div', { class: 'dlg-tr' }, s.tr) : null,
        showIt ? el('div', { class: 'dlg-it' }, s.it) : null));
    }
  }
  paint();
  card.append(body);

  const toggle = el('button', {
    class: 'btn btn-secondary btn-block', style: 'margin-top:12px',
    onclick: () => { showIt = !showIt; toggle.textContent = showIt ? 'Nascondi la traduzione' : 'Mostra la traduzione'; paint(); }
  }, 'Mostra la traduzione');
  card.append(toggle,
    el('p', { class: 'teach-note' }, 'Prima prova a capire senza traduzione: è l\u2019allenamento che conta.'));

  mount.append(card,
    el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true) }, 'Continua')));
}
