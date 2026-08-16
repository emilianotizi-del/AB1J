// Presentazione di una lettera o di una parola nuova (nessuna valutazione).
import { el, wordBlock } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export async function render(step, mount, ctx) {
  const card = el('div', { class: 'card teach-card' });

  if (step.kind === 'letter') {
    const L = await ctx.letter(step.ref);
    card.append(
      el('div', { class: 'big-glyph', lang: 'hy' }, L.upper),
      el('div', { class: 'glyph-pair', lang: 'hy' }, `${L.upper} ${L.lower}`),
      el('div', { class: 'letter-name' }, `«${L.name}»`),
      el('div', { class: 'letter-sound' }, `suono ${L.ipa} · traslitterazione “${L.tr}”`)
    );
    if (L.note) card.append(el('p', { class: 'teach-note' }, L.note));
    card.append(el('div', { style: 'margin-top:14px' },
      el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: () => speak(L.lower) }, '🔊')));
  } else {
    card.append(wordBlock(step.word));
    if (step.note) card.append(el('p', { class: 'teach-note' }, step.note));
    card.append(el('div', { style: 'margin-top:14px' },
      el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: () => speak(step.word.speak || step.word.hy) }, '🔊')));
  }

  mount.append(card,
    el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true) }, 'Continua')));
}
