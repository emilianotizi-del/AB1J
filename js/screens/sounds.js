// Allenamento lettera ↔ suono: 10 round in due direzioni alternate.
// - Senti il suono → scegli la lettera (tra 4)
// - Vedi la lettera → scegli la lettura (tra 4)
// Usa solo le lettere già incontrate nel corso; i distrattori vengono
// preferibilmente dalle lettere confondibili (aspirata/non aspirata, ecc.).
import { el, shuffle, vibrate } from '../utils/dom.js';
import { getAlphabet, getCourse } from '../core/data.js';
import { getCompleted, recordEvent } from '../core/store.js';
import { speak } from '../core/audio.js';

const ROUNDS = 10;
// Gruppi di lettere che si confondono facilmente (per distrattori mirati)
const CONFUSABLE = [
  ['Ր', 'Ռ'], ['Կ', 'Ք', 'Գ'], ['Տ', 'Թ', 'Դ'], ['Ց', 'Ծ', 'Ձ'],
  ['Չ', 'Ճ', 'Ջ'], ['Պ', 'Փ', 'Բ'], ['Ս', 'Զ', 'Շ', 'Ժ'],
  ['Ե', 'Է', 'Ը', 'Ի'], ['Ո', 'Օ'], ['Խ', 'Հ', 'Ղ'], ['Վ', 'Ֆ'],
  ['Մ', 'Ն'], ['Յ', 'Ի'], ['Լ', 'Ղ']
];

async function knownLetters() {
  const [alpha, course] = await Promise.all([getAlphabet(), getCourse()]);
  const done = getCompleted();
  const known = new Set();
  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      if (done.includes(les.id)) (les.letters || []).forEach(u => known.add(u));
    }
  }
  return alpha.letters.filter(l => known.has(l.upper));
}

function pickOptions(target, pool) {
  const group = CONFUSABLE.find(g => g.includes(target.upper)) || [];
  const confusable = pool.filter(l => l !== target && group.includes(l.upper));
  const others = shuffle(pool.filter(l => l !== target && !group.includes(l.upper)));
  return shuffle([target, ...shuffle(confusable).concat(others).slice(0, 3)]);
}

export async function render(mount) {
  mount.innerHTML = '';
  mount.append(el('div', { class: 'screen-head' },
    el('a', { class: 'btn-ghost', href: '#/alphabet', 'aria-label': 'Torna all\u2019alfabeto' }, '←'),
    el('h1', {}, 'Allena i suoni')));

  const pool = await knownLetters();
  if (pool.length < 4) {
    mount.append(el('div', { class: 'card review-empty' },
      el('h2', {}, 'Ancora poche lettere'),
      el('p', {}, 'Completa le prime due lezioni: da quattro lettere in su l\u2019allenamento si sblocca.')));
    return;
  }

  let round = 0;
  let score = 0;
  const holder = el('div', {});
  const counter = el('p', { style: 'text-align:center;color:var(--ink-soft);margin-bottom:10px' });
  mount.append(counter, holder);

  function next() {
    if (round >= ROUNDS) return finish();
    counter.textContent = `Round ${round + 1} di ${ROUNDS}`;
    holder.innerHTML = '';
    const target = pool[Math.floor(Math.random() * pool.length)];
    const options = pickOptions(target, pool);
    const soundToLetter = round % 2 === 0;

    const card = el('div', { class: 'card', style: 'text-align:center' });
    if (soundToLetter) {
      card.append(el('h2', {}, 'Che lettera senti?'),
        el('div', { style: 'margin:16px 0' },
          el('button', { class: 'btn-audio', style: 'width:64px;height:64px;font-size:1.6rem',
            'aria-label': 'Riascolta', onclick: () => speak(target.lower) }, '🔊')));
      speak(target.lower);
    } else {
      card.append(el('h2', {}, 'Come si legge?'),
        el('div', { class: 'hy-display', lang: 'hy',
          style: 'font-size:4rem;font-weight:700;margin:10px 0;color:var(--garnet)' },
          `${target.upper} ${target.lower}`));
    }

    const opts = el('div', { class: 'options', style: 'grid-template-columns:1fr 1fr' });
    let answered = false;
    for (const o of options) {
      const label = soundToLetter ? `${o.upper} ${o.lower}` : `${o.tr} · ${o.ipa}`;
      const b = el('button', { class: 'option' + (soundToLetter ? ' hy' : ''), lang: soundToLetter ? 'hy' : 'it' }, label);
      b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const ok = o === target;
        if (ok) score++;
        recordEvent();
        b.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) {
          const right = [...opts.children][options.indexOf(target)];
          right.classList.add('correct');
          vibrate([60, 40, 60]);
        } else vibrate(30);
        if (!soundToLetter) speak(target.lower);
        holder.append(el('div', { class: 'lesson-footer' },
          el('button', { class: 'btn btn-block', onclick: () => { round++; next(); } }, 'Avanti')));
      });
      opts.append(b);
    }
    card.append(opts);
    holder.append(card);
  }

  function finish() {
    counter.textContent = '';
    holder.innerHTML = '';
    holder.append(el('div', { class: 'card review-empty' },
      el('div', { style: 'font-size:3rem' }, score >= 8 ? '🏆' : '💪'),
      el('h2', {}, `${score} su ${ROUNDS}`),
      el('p', {}, score >= 8
        ? 'Orecchio eccellente. Le lettere stanno diventando suoni.'
        : 'Le coppie difficili (Տ/Թ, Կ/Ք, Ր/Ռ…) si domano a forza di round: rifallo spesso.'),
      el('div', { style: 'margin-top:20px;display:grid;gap:10px' },
        el('button', { class: 'btn btn-block', onclick: () => { round = 0; score = 0; next(); } }, 'Ancora 10 round'),
        el('a', { class: 'btn btn-secondary btn-block', href: '#/alphabet' }, 'Torna all\u2019alfabeto'))));
  }

  next();
}
