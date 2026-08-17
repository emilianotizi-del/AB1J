// Esercizio "confondibili": allena a distinguere le lettere dai suoni composti,
// nei due sensi che sono difficili — vedi→suono e senti→scrivi/scegli.
import { el, shuffle, vibrate } from '../utils/dom.js';
import { getConfusableGroups, getHardWords, getAlphabet } from '../core/data.js';
import { speak } from '../core/audio.js';

export async function render(mount) {
  const { groups } = await getConfusableGroups();
  const hard = await getHardWords();
  const alpha = await getAlphabet();

  // Mappa lettera → suono (tr) e parole
  const trOf = {};
  for (const L of alpha.letters) trOf[L.lower] = L.tr;
  const wordsOf = {};
  for (const e of hard.letters) wordsOf[e.letter] = e.words;

  mount.innerHTML = '';
  mount.append(el('h1', { class: 'screen-title' }, 'Lettere confondibili'));

  // Schermata di scelta: quale gruppo allenare
  function menu() {
    mount.innerHTML = '';
    mount.append(el('h1', { class: 'screen-title' }, 'Lettere confondibili'));
    mount.append(el('p', { style: 'color:var(--ink-soft);margin-bottom:16px' },
      'Allena a distinguere le lettere che si somigliano. Scegli un gruppo.'));
    for (const g of groups) {
      const card = el('button', { class: 'confuse-group', onclick: () => train(g) },
        el('div', { class: 'confuse-letters hy', lang: 'hy' }, g.letters.join('  ')),
        el('div', { class: 'confuse-name' }, g.name),
        el('div', { class: 'confuse-hint' }, g.hint));
      mount.append(card);
    }
  }

  // Allenamento su un gruppo: alterna due tipi di domanda
  function train(group) {
    let round = 0, correct = 0;
    const total = 10;

    function next() {
      if (round >= total) return done();
      mount.innerHTML = '';
      mount.append(el('div', { class: 'confuse-progress' }, `${round + 1} / ${total}`));

      // Scelgo una lettera-bersaglio dal gruppo e una parola che la contiene
      const target = group.letters[Math.floor(Math.random() * group.letters.length)];
      const pool = (wordsOf[target] || []).filter(w => w.hy.includes(target));
      if (!pool.length) { round++; return next(); }
      const word = pool[Math.floor(Math.random() * pool.length)];

      // Tipo di domanda alternato: pari = senti→scegli lettera, dispari = vedi lettera→scegli suono
      const mode = round % 2 === 0 ? 'hear' : 'see';
      const card = el('div', { class: 'card' });

      if (mode === 'hear') {
        // Senti la parola, scegli quale delle lettere-gruppo contiene
        card.append(el('p', { class: 'confuse-q' }, 'Ascolta e scegli la lettera che senti nella parola'));
        card.append(el('button', { class: 'btn-audio', style: 'margin:8px auto;display:block',
          onclick: () => speak(word.hy) }, '🔊'));
        card.append(el('p', { style: 'text-align:center;color:var(--ink-soft);font-size:.85rem' },
          '(' + word.it + ')'));
        speak(word.hy);
        const opts = el('div', { class: 'confuse-opts' });
        for (const L of shuffle(group.letters.slice())) {
          opts.append(el('button', { class: 'confuse-opt hy', lang: 'hy',
            onclick: e => check(e.currentTarget, L === target, card, word) }, L));
        }
        card.append(opts);
      } else {
        // Vedi la lettera, scegli il suono giusto tra i confondibili
        card.append(el('p', { class: 'confuse-q' }, 'Che suono ha questa lettera?'));
        card.append(el('div', { class: 'confuse-big hy', lang: 'hy' }, target));
        const opts = el('div', { class: 'confuse-opts' });
        for (const L of shuffle(group.letters.slice())) {
          opts.append(el('button', { class: 'confuse-opt',
            onclick: e => check(e.currentTarget, L === target, card, word) }, trOf[L]));
        }
        card.append(opts);
      }
      mount.append(card);
    }

    function check(btn, ok, card, word) {
      if (card.dataset.done) return;
      card.dataset.done = '1';
      if (ok) {
        btn.classList.add('opt-ok'); correct++; vibrate(20);
      } else {
        btn.classList.add('opt-no'); vibrate([40, 30, 40]);
      }
      // Mostro sempre la parola con la lettera evidenziata + audio, come rinforzo
      const reveal = el('div', { class: 'confuse-reveal' });
      const hy = el('div', { class: 'hy', lang: 'hy', style: 'font-size:1.6rem;font-weight:700' });
      for (const ch of word.hy) {
        hy.append(el('span', group.letters.includes(ch) ? { class: 'confuse-mark' } : {}, ch));
      }
      reveal.append(hy, el('div', { style: 'color:var(--ink-soft);font-size:.9rem' }, word.it),
        el('button', { class: 'btn-audio', style: 'margin-top:6px', onclick: () => speak(word.hy) }, '🔊'));
      card.append(reveal);
      card.append(el('button', { class: 'btn btn-block', style: 'margin-top:12px',
        onclick: () => { round++; next(); } }, round + 1 >= total ? 'Vedi risultato' : 'Continua →'));
    }

    function done() {
      mount.innerHTML = '';
      mount.append(el('div', { class: 'card', style: 'text-align:center' },
        el('div', { style: 'font-size:2.4rem' }, correct >= 8 ? '🏆' : '💪'),
        el('h2', {}, `${correct} / ${total}`),
        el('p', { style: 'color:var(--ink-soft)' },
          correct >= 8 ? 'Le distingui bene!' : 'Continua ad allenarti: migliora ogni volta.'),
        el('div', { style: 'display:grid;gap:10px;margin-top:16px' },
          el('button', { class: 'btn btn-block', onclick: () => train(group) }, 'Ancora questo gruppo'),
          el('button', { class: 'btn btn-block btn-ghost-line', onclick: menu }, 'Altri gruppi'))));
    }

    next();
  }

  menu();
}
