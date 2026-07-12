// Riordino: comporre la frase armena nell'ordine giusto.
// step: { it, tokens: ["Բարև","ձեզ"], speakText? }
import { el, vibrate } from '../utils/dom.js';
import { tileBuilder } from '../utils/tiles.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  card.append(
    el('h2', { style: 'text-align:center' }, 'Componi la frase'),
    el('p', { style: 'text-align:center;color:var(--ink-soft);margin-top:6px' }, `«${step.it}»`));
  if (step.speakText) {
    card.append(el('div', { style: 'text-align:center;margin-top:10px' },
      el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: () => speak(step.speakText) }, '🔊')));
  }

  const builder = tileBuilder({ tokens: step.tokens, isHy: true });
  card.append(builder.el);

  let done = false;
  const checkBtn = el('button', { class: 'btn btn-block', style: 'margin-top:16px', onclick: check }, 'Verifica');
  card.append(checkBtn);
  mount.append(card);

  function check() {
    if (done) return;
    const ok = builder.value().join(' ') === step.tokens.join(' ');
    done = true;
    builder.lock();
    builder.markResult(ok);
    checkBtn.remove();
    vibrate(ok ? 30 : [60, 40, 60]);
    card.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'err') },
      ok ? '✓ Esatto!' : `✗ L'ordine giusto è: ${step.tokens.join(' ')}`));
    mount.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(ok) }, 'Avanti')));
  }
}
