// Scrittura digitata: l'utente compone la risposta con la tastiera armena interna.
// step: { prompt, it?, speakText?, answer, hint? }  (answer = forma armena attesa)
// Modalità: se c'è speakText → "scrivi ciò che senti"; altrimenti "traduci e scrivi".
import { el, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';
import { makeKeyboard } from '../core/keyboard.js';

// Normalizza per un confronto indulgente su spazi e punteggiatura, severo sulle lettere
function norm(s) {
  return String(s).trim().replace(/[։.,՞՜՛?!]/g, '').replace(/\s+/g, ' ').toLowerCase();
}

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  card.append(el('h2', { style: 'text-align:center' }, step.prompt || (step.speakText ? 'Scrivi ciò che senti' : 'Traduci e scrivi')));

  if (step.speakText) {
    card.append(el('div', { style: 'text-align:center;margin:12px 0' },
      el('button', { class: 'btn-audio', style: 'width:60px;height:60px;font-size:1.5rem',
        'aria-label': 'Riascolta', onclick: () => speak(step.speakText) }, '🔊')));
    speak(step.speakText);
  }
  if (step.it) card.append(el('p', { style: 'text-align:center;color:var(--ink-soft)' }, `«${step.it}»`));

  const display = el('div', { class: 'write-display hy', lang: 'hy' });
  const caret = el('span', { class: 'write-caret' }, '');
  let text = '';
  function paint() {
    display.textContent = text;
    display.append(caret);
  }
  paint();
  card.append(display);
  if (step.hint) card.append(el('p', { class: 'write-hint' }, '💡 ' + step.hint));

  const feedback = el('div', {});
  const checkBtn = el('button', { class: 'btn btn-block', style: 'margin-top:12px', onclick: check }, 'Verifica');

  const kb = makeKeyboard(
    ch => { if (!done) { text += ch; paint(); } },
    () => { if (!done) { text = text.slice(0, -1); paint(); } }
  );

  card.append(kb, checkBtn, feedback);
  mount.append(card);

  let done = false;
  function check() {
    if (done) return;
    if (!text.trim()) return;
    done = true;
    const ok = norm(text) === norm(step.answer);
    kb.querySelectorAll('button').forEach(b => b.disabled = true);
    checkBtn.remove();
    display.classList.add(ok ? 'write-ok' : 'write-err');
    vibrate(ok ? 30 : [60, 40, 60]);
    feedback.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'err') },
      ok ? '✓ Perfetto!' : `✗ Giusto è: ${step.answer}`));
    if (!ok) {
      display.textContent = text;   // lascia vedere cos'hai scritto
    }
    if (step.speakText) speak(step.speakText);
    mount.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(ok) }, 'Avanti')));
  }
}
