// Componitore a tessere: si toccano le tessere della riserva per aggiungerle
// alla risposta; toccando una tessera della risposta la si rimanda indietro.
// Usato da dettato (lettere) e riordino frasi (parole).
import { el, shuffle } from './dom.js';

export function tileBuilder({ tokens, isHy = true, onChange = () => {} }) {
  const wrap = el('div', {});
  const answer = el('div', {
    class: 'tile-answer',
    'aria-label': 'La tua risposta'
  });
  const bank = el('div', { class: 'tile-bank' });
  wrap.append(answer, bank);

  const placed = [];   // tessere nella risposta, in ordine

  function makeTile(token) {
    const t = el('button', { class: 'tile' + (isHy ? ' hy' : ''), lang: isHy ? 'hy' : 'it' }, token);
    t.addEventListener('click', () => {
      if (t.parentElement === bank) {
        answer.append(t);
        placed.push(t);
      } else {
        bank.append(t);
        placed.splice(placed.indexOf(t), 1);
      }
      onChange(value());
    });
    return t;
  }

  for (const tok of shuffle(tokens)) bank.append(makeTile(tok));

  function value() { return placed.map(t => t.textContent); }
  function lock() { wrap.querySelectorAll('.tile').forEach(t => { t.disabled = true; }); }
  function markResult(ok) { answer.classList.add(ok ? 'tile-ok' : 'tile-err'); }

  return { el: wrap, value, lock, markResult };
}
