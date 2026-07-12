// Dialogo: battute alternate tra due parlanti, ognuna con audio.
// step: { title?, lines: [{who:'A'|'B', hy, tr, ipa, it}] }
import { el } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  if (step.title) card.append(el('h2', { style: 'text-align:center;margin-bottom:12px' }, step.title));

  for (const line of step.lines) {
    const bubble = el('button', {
      class: 'dlg-line ' + (line.who === 'B' ? 'dlg-b' : 'dlg-a'),
      'aria-label': 'Ascolta la battuta',
      onclick: () => speak(line.hy)
    },
      el('div', { class: 'dlg-hy hy', lang: 'hy' }, line.hy + ' 🔊'),
      line.tr ? el('div', { class: 'dlg-tr' }, line.tr) : null,
      line.ipa ? el('div', { class: 'dlg-ipa' }, line.ipa) : null,
      el('div', { class: 'dlg-it' }, line.it));
    card.append(bubble);
  }
  card.append(el('p', { class: 'teach-note' }, 'Tocca ogni battuta per ascoltarla. Rileggi finché non ti suona naturale.'));

  mount.append(card,
    el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true) }, 'Continua')));
}
