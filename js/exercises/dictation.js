// Dettato: si ascolta la parola e la si compone con tessere di lettere.
// step: { word: {hy,tr,ipa,it}, distractors?: ["տ","ն"] }
import { el, vibrate, wordBlock } from '../utils/dom.js';
import { tileBuilder } from '../utils/tiles.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const target = step.word.hy;
  const letters = Array.from(target).filter(c => c !== ' ');
  const tokens = letters.concat(step.distractors || []);

  const card = el('div', { class: 'card' });
  card.append(
    el('h2', { style: 'text-align:center' }, 'Ascolta e scrivi la parola'),
    el('div', { style: 'text-align:center;margin:14px 0' },
      el('button', { class: 'btn-audio', style: 'width:64px;height:64px;font-size:1.6rem',
        'aria-label': 'Ascolta la parola', onclick: () => speak(target) }, '🔊')));

  const builder = tileBuilder({ tokens, isHy: true });
  card.append(builder.el);

  let done = false;
  const checkBtn = el('button', { class: 'btn btn-block', style: 'margin-top:16px', onclick: check }, 'Verifica');
  card.append(checkBtn);
  mount.append(card);
  speak(target); // primo ascolto (dopo un gesto utente c'è già stato: il passaggio di step)

  function check() {
    if (done) return;
    const built = builder.value().join('');
    const ok = built === letters.join('');
    done = true;
    builder.lock();
    builder.markResult(ok);
    checkBtn.remove();
    vibrate(ok ? 30 : [60, 40, 60]);
    const fb = el('div', { class: 'feedback ' + (ok ? 'ok' : 'err') },
      ok ? '✓ Perfetto!' : '✗ Non proprio. La parola era:');
    card.append(fb);
    if (!ok) card.append(el('div', { style: 'margin-top:10px' }, wordBlock(step.word)));
    mount.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(ok) }, 'Avanti')));
  }
}
