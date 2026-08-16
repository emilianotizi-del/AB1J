// Task-based: una "missione" comunicativa in tre fasi.
// step: {
//   goal: "Compra due chili di mele e scopri quanto paghi",
//   pretask: { phrases: [{hy,tr,it,note?}], intro? },
//   turns: [ { npc:{hy,tr,it}, prompt, options:[{hy,tr,it,ok:bool,reply?}] } ],
//   debrief: { title, points:[...] }
// }
import { el, shuffle, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  let phase = 'pre';           // pre → play → done
  let turnIdx = 0;
  let stumbles = 0;
  const wrap = el('div', {});
  mount.append(wrap);

  function header(txt) {
    return el('div', { class: 'task-goal' }, el('span', { class: 'task-badge' }, '🎯 Missione'), txt);
  }

  // ---------- FASE 1: pre-task ----------
  function renderPre() {
    wrap.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.append(header(step.goal));
    if (step.pretask.intro) card.append(el('p', { style: 'margin-top:10px;color:var(--ink-soft)' }, step.pretask.intro));
    card.append(el('div', { style: 'font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft);margin:14px 0 8px' }, 'Ti serviranno queste frasi'));
    for (const p of step.pretask.phrases) {
      card.append(el('button', { class: 'task-phrase', onclick: () => speak(p.hy) },
        el('div', {},
          el('span', { class: 'hy', lang: 'hy', style: 'font-weight:600;font-size:1.1rem' }, p.hy),
          el('span', { style: 'margin-left:8px;color:var(--ink-soft)' }, p.it)),
        el('span', { style: 'opacity:.5' }, '🔊')));
    }
    card.append(el('button', { class: 'btn btn-block', style: 'margin-top:16px',
      onclick: () => { phase = 'play'; renderPlay(); } }, 'Sono pronto →'));
    wrap.append(card);
  }

  // ---------- FASE 2: task interattivo ----------
  function renderPlay() {
    wrap.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.append(header(step.goal));

    const t = step.turns[turnIdx];
    // battuta dell'interlocutore (NPC)
    const npc = el('div', { class: 'task-npc' },
      el('div', { class: 'task-npc-av' }, '🧑‍🌾'),
      el('div', {},
        el('div', { class: 'hy', lang: 'hy', style: 'font-size:1.15rem' }, t.npc.hy),
        el('button', { class: 'btn-audio', style: 'margin-top:6px;width:40px;height:40px;font-size:1rem',
          'aria-label': 'Ascolta', onclick: () => speak(t.npc.hy) }, '🔊'),
        el('div', { style: 'color:var(--ink-soft);font-size:.85rem;margin-top:4px' }, t.npc.it)));
    card.append(npc);
    speak(t.npc.hy);

    card.append(el('p', { class: 'task-prompt' }, t.prompt));

    const opts = el('div', { style: 'display:grid;gap:10px;margin-top:8px' });
    let answered = false;
    for (const o of shuffle(t.options)) {
      const b = el('button', { class: 'task-reply hy', lang: 'hy' }, o.hy);
      b.addEventListener('click', () => {
        if (answered) return;
        if (o.ok) {
          answered = true;
          b.classList.add('reply-ok');
          vibrate(30);
          if (o.reply) {
            opts.after(el('div', { class: 'task-npc task-npc-reply' },
              el('div', { class: 'task-npc-av' }, '🧑‍🌾'),
              el('div', {}, el('div', { class: 'hy', lang: 'hy' }, o.reply.hy),
                el('div', { style: 'color:var(--ink-soft);font-size:.85rem' }, o.reply.it))));
            speak(o.reply.hy);
          }
          card.append(el('button', { class: 'btn btn-block', style: 'margin-top:14px', onclick: () => {
            turnIdx++;
            if (turnIdx >= step.turns.length) { phase = 'done'; renderDone(); }
            else renderPlay();
          } }, 'Continua →'));
        } else {
          // errore: il venditore "non capisce", si riprova (nessuna penalità dura)
          stumbles++;
          b.classList.add('reply-no');
          b.disabled = true;
          vibrate([50, 30, 50]);
          card.querySelector('.task-hint')?.remove();
          card.append(el('p', { class: 'task-hint' }, '🤔 Non ti capisce: prova un\'altra frase.'));
        }
      });
      opts.append(b);
    }
    card.append(opts);
    wrap.append(card);
  }

  // ---------- FASE 3: focus on form (la regola, DOPO l'uso) ----------
  function renderDone() {
    wrap.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.append(el('div', { style: 'text-align:center;font-size:2.4rem' }, stumbles === 0 ? '🏆' : '✅'),
      el('h2', { style: 'text-align:center' }, 'Missione compiuta!'),
      el('p', { style: 'text-align:center;color:var(--ink-soft)' },
        stumbles === 0 ? 'Perfetto, senza esitazioni.' : `Ce l'hai fatta (${stumbles} tentativ${stumbles===1?'o':'i'} a vuoto).`));
    if (step.debrief) {
      card.append(el('div', { class: 'task-debrief' },
        el('div', { style: 'font-weight:700;margin-bottom:8px' }, '💡 ' + step.debrief.title),
        ...step.debrief.points.map(p => el('p', { style: 'margin:6px 0;font-size:.92rem' }, '• ' + p))));
    }
    card.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true) }, 'Fine')));
    wrap.append(card);
  }

  renderPre();
}
