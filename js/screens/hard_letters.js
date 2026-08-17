// Schermata "Lettere difficili": schede mnemoniche per le 8 lettere dai suoni composti/confondibili.
import { el } from '../utils/dom.js';
import { getHardLetters } from '../core/data.js';
import { speak } from '../core/audio.js';

export async function render(mount) {
  const data = await getHardLetters();
  mount.innerHTML = '';

  mount.append(el('h1', { class: 'screen-title' }, 'Lettere difficili'));
  mount.append(el('p', { style: 'color:var(--ink-soft);margin-bottom:16px' },
    'Le 8 lettere dai suoni composti e facili da confondere. Una parola-ancora e un trucco per ciascuna. Toccale a mente fresca, una alla volta.'));

  for (const c of data.cards) {
    const card = el('div', { class: 'hard-card' });
    // Blocco lettere maiuscola/minuscola
    const glyphs = el('div', { class: 'hard-glyphs' },
      el('div', {},
        el('div', { class: 'hard-upper hy-display', lang: 'hy' }, c.upper),
        el('div', { class: 'hard-glabel' }, 'MAIUSC')),
      el('div', {},
        el('div', { class: 'hard-lower hy-display', lang: 'hy' }, c.lower),
        el('div', { class: 'hard-glabel' }, 'minusc')));
    // Suono + parola-ancora (con audio)
    const info = el('div', { class: 'hard-info' },
      el('div', { class: 'hard-sound' }, 'suono \u201c' + c.tr + '\u201d'),
      el('div', { class: 'hard-ipa' }, c.ipa),
      el('button', { class: 'hard-word', onclick: () => speak(c.word) },
        el('span', { class: 'hy', lang: 'hy' }, c.word),
        el('span', { class: 'hard-meaning' }, ' = ' + c.meaning + ' '),
        el('span', {}, '🔊')));
    card.append(el('div', { class: 'hard-top' }, glyphs, info));
    // Come suona
    card.append(el('div', { class: 'hard-block' },
      el('span', { class: 'hard-tag' }, 'Come suona: '), c.italian));
    // Trucco
    card.append(el('div', { class: 'hard-block' },
      el('span', { class: 'hard-tag accent' }, 'Trucco: '), c.hookForm));
    // Maiuscola/minuscola
    card.append(el('div', { class: 'hard-block' },
      el('span', { class: 'hard-tag accent' }, 'Maiusc/minusc: '), c.hookCase));
    mount.append(card);
  }

  mount.append(el('p', { style: 'color:var(--ink-soft);font-size:.85rem;margin-top:16px;text-align:center' },
    'Consiglio: scrivi a mano queste 8 lettere. La memoria della mano fissa la forma meglio della vista.'));
}
