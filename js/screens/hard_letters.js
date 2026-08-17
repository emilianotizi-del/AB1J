// "Lettere difficili": per ognuna delle 8, molte parole che la contengono (con audio),
// così la lettera emerge come pattern ricorrente. Più un accesso all'esercizio confondibili.
import { el } from '../utils/dom.js';
import { getHardWords, getAlphabet } from '../core/data.js';
import { speak } from '../core/audio.js';

export async function render(mount) {
  const hard = await getHardWords();
  const alpha = await getAlphabet();
  const info = {};
  for (const L of alpha.letters) info[L.lower] = L;

  mount.innerHTML = '';
  mount.append(el('h1', { class: 'screen-title' }, 'Lettere difficili'));
  mount.append(el('p', { style: 'color:var(--ink-soft);margin-bottom:14px' },
    'Le 8 lettere dai suoni composti. Per ognuna, tante parole che la contengono: toccale per sentirle e lascia che la lettera ti "salti all\u2019occhio".'));

  mount.append(el('a', { class: 'btn btn-block btn-accent', href: '#/confusable', style: 'margin-bottom:18px' },
    '🎯 Allena le confondibili'));

  const STUDY = 'ձժջչճզծշ';   // le 8 lettere che l'utente studia (ց è solo distrattore nell'esercizio)
  for (const e of hard.letters) {
    if (!STUDY.includes(e.letter)) continue;
    const L = info[e.letter] || {};
    const block = el('div', { class: 'hard-card' });
    block.append(el('div', { class: 'hard-top' },
      el('div', { class: 'hard-glyphs' },
        el('div', {}, el('div', { class: 'hard-upper hy-display', lang: 'hy' }, (L.upper || e.letter.toUpperCase())),
          el('div', { class: 'hard-glabel' }, 'MAIUSC')),
        el('div', {}, el('div', { class: 'hard-lower hy-display', lang: 'hy' }, e.letter),
          el('div', { class: 'hard-glabel' }, 'minusc'))),
      el('div', { class: 'hard-info' },
        el('div', { class: 'hard-sound' }, 'suono \u201c' + (L.tr || '') + '\u201d'),
        el('div', { class: 'hard-ipa' }, L.ipa || ''))));

    // Griglia di parole: la lettera-bersaglio evidenziata in ognuna
    const grid = el('div', { class: 'hard-words' });
    for (const w of e.words) {
      const chip = el('button', { class: 'hard-wchip', onclick: () => speak(w.hy) });
      const hy = el('span', { class: 'hy', lang: 'hy' });
      for (const ch of w.hy) hy.append(el('span', ch === e.letter ? { class: 'confuse-mark' } : {}, ch));
      chip.append(hy, el('span', { class: 'hard-wit' }, w.it));
      if (w.src === 'extra') chip.append(el('span', { class: 'hard-extra', title: 'da confermare' }, '·'));
      grid.append(chip);
    }
    block.append(grid);
    mount.append(block);
  }

  mount.append(el('p', { style: 'color:var(--ink-soft);font-size:.85rem;margin-top:16px;text-align:center' },
    'Le parole con il puntino (·) sono aggiunte oltre al corso: utili per allenarti, da confermare con un madrelingua. Scrivi a mano queste lettere: aiuta molto.'));
}
