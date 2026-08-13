// Tastiera armena su schermo, lettere raggruppate per famiglia di suono.
// Non dipende dalla tastiera di sistema (che su iOS va installata a mano).
// Uso: makeKeyboard(onInsert, onBackspace) → elemento DOM da montare.
import { el } from '../utils/dom.js';

// Righe raggruppate per affinità fonetica: vocali, poi consonanti per luogo/modo,
// con le confondibili vicine così l'occhio impara a distinguerle.
const ROWS = [
  ['ա', 'ե', 'է', 'ը', 'ի', 'ո', 'օ', 'ու'],
  ['բ', 'պ', 'փ', 'դ', 'տ', 'թ', 'գ', 'կ', 'ք'],
  ['ձ', 'ծ', 'ց', 'ջ', 'ճ', 'չ', 'զ', 'ս', 'ց'],
  ['մ', 'ն', 'լ', 'ր', 'ռ', 'յ', 'վ', 'ֆ'],
  ['հ', 'խ', 'ղ', 'շ', 'ժ', 'ց', 'և']
];
// Nota: "ու" è il digramma; lo trattiamo come tasto singolo.

export function makeKeyboard(onInsert, onBackspace) {
  const kb = el('div', { class: 'hy-keyboard' });
  const seen = new Set();
  for (const row of ROWS) {
    const r = el('div', { class: 'kb-row' });
    for (const ch of row) {
      if (seen.has(ch)) continue;      // evita doppioni tra righe
      seen.add(ch);
      r.append(el('button', {
        class: 'kb-key hy', lang: 'hy', type: 'button',
        onclick: () => onInsert(ch)
      }, ch));
    }
    kb.append(r);
  }
  // Riga funzioni: spazio + cancella
  kb.append(el('div', { class: 'kb-row' },
    el('button', { class: 'kb-key kb-space', type: 'button', onclick: () => onInsert(' ') }, 'spazio'),
    el('button', { class: 'kb-key kb-back', type: 'button', onclick: onBackspace }, '⌫')));
  return kb;
}
