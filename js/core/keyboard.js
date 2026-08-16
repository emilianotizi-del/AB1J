// Tastiera armena su schermo, layout allineato a quello di iOS (fonetico standard).
// Le prime 3 righe replicano la disposizione della tastiera armena di iPhone;
// la 4ª riga raccoglie le lettere che su iOS stanno nel livello shift/long-press,
// così sono tutte raggiungibili senza cambiare livello.
import { el } from '../utils/dom.js';

const ROWS = [
  ['ք', 'ո', 'ե', 'ռ', 'տ', 'ը', 'ւ', 'ի', 'օ', 'պ'],
  ['ա', 'ս', 'դ', 'ֆ', 'գ', 'հ', 'յ', 'կ', 'լ', 'թ'],
  ['զ', 'ղ', 'ց', 'վ', 'բ', 'ն', 'մ', 'շ', 'ջ'],
  ['է', 'ր', 'ժ', 'խ', 'ծ', 'ձ', 'ճ', 'չ', 'փ', 'և']
];
// "ու" (digramma) si compone con ո + ւ, entrambi presenti.

export function makeKeyboard(onInsert, onBackspace) {
  const kb = el('div', { class: 'hy-keyboard' });
  for (const row of ROWS) {
    const r = el('div', { class: 'kb-row' });
    for (const ch of row) {
      r.append(el('button', {
        class: 'kb-key hy', lang: 'hy', type: 'button',
        onclick: () => onInsert(ch)
      }, ch));
    }
    kb.append(r);
  }
  kb.append(el('div', { class: 'kb-row' },
    el('button', { class: 'kb-key kb-space', type: 'button', onclick: () => onInsert(' ') }, 'spazio'),
    el('button', { class: 'kb-key kb-back', type: 'button', onclick: onBackspace }, '⌫')));
  return kb;
}
