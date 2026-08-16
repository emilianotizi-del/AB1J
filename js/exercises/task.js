// Task-based: missione comunicativa in 3 fasi (pre-task → interazione → debrief).
// Novità: iniziativa dello studente, communication repair, replay a scaffolding decrescente.
// step: {
//   goal, archetype?,
//   pretask: { intro?, phrases:[{hy,tr,it}] },
//   turns: [ {
//     npc?: {hy,tr,it},              // battuta dell'interlocutore (assente se inizia lo studente)
//     studentFirst?: bool,          // true = lo studente apre il turno
//     prompt,                       // consegna in italiano (cosa fare)
//     options: [ {hy,tr,it,ok,reply?} ],
//     repair?: { hy,tr,it }         // battuta di "non ho capito" sempre disponibile (se presente)
//   } ],
//   debrief: { title, points:[...] }
// }
// scaffolding: ctx.scaffold ∈ {full, light, none} regola quanti aiuti mostrare.
import { el, shuffle, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';

export function render(step, mount, ctx) {
  const scaffold = ctx.scaffold || 'full';   // full = tutti gli aiuti; light = meno; none = minimo
  let turnIdx = 0, stumbles = 0;
  const wrap = el('div', {});
  mount.append(wrap);

  const header = txt => el('div', { class: 'task-goal' },
    el('span', { class: 'task-badge' }, '🎯 Missione'), txt);

  // ---------- FASE 1: pre-task ----------
  function renderPre() {
    wrap.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.append(header(step.goal));
    if (step.pretask.intro) card.append(el('p', { style: 'margin-top:10px;color:var(--ink-soft)' }, step.pretask.intro));

    // Con scaffolding pieno mostro tutte le frasi-chiave; light = solo armeno+audio; none = salto il pre-task
    if (scaffold !== 'none') {
      card.append(el('div', { style: 'font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft);margin:14px 0 8px' },
        scaffold === 'full' ? 'Ti serviranno queste frasi' : 'Ripasso veloce'));
      for (const p of step.pretask.phrases) {
        card.append(el('button', { class: 'task-phrase', onclick: () => speak(p.hy) },
          el('div', {},
            el('span', { class: 'hy', lang: 'hy', style: 'font-weight:600;font-size:1.1rem' }, p.hy),
            scaffold === 'full' ? el('span', { class: 'w-it-teach', style: 'margin-left:8px;color:var(--ink-soft)' }, p.it) : null),
          el('span', { style: 'opacity:.5' }, '🔊')));
      }
    }
    const btnText = scaffold === 'none' ? 'Inizia la missione →' : 'Sono pronto →';
    card.append(el('button', { class: 'btn btn-block', style: 'margin-top:16px',
      onclick: () => renderPlay() }, btnText));
    wrap.append(card);
  }

  // ---------- FASE 2: interazione ----------
  function renderPlay() {
    wrap.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.append(header(step.goal));
    const t = step.turns[turnIdx];

    // Se c'è una battuta dell'interlocutore (e non è lo studente ad aprire), la mostro
    if (t.npc && !t.studentFirst) {
      const npc = el('div', { class: 'task-npc' },
        el('div', { class: 'task-npc-av' }, '🧑‍🌾'),
        el('div', {},
          el('div', { class: 'hy', lang: 'hy', style: 'font-size:1.15rem' }, t.npc.hy),
          el('button', { class: 'btn-audio', style: 'margin-top:6px;width:40px;height:40px;font-size:1rem',
            'aria-label': 'Ascolta', onclick: () => speak(t.npc.hy) }, '🔊'),
          scaffold !== 'none' && t.npc.it ? el('div', { class: 'w-it', style: 'color:var(--ink-soft);font-size:.85rem;margin-top:4px' }, t.npc.it) : null));
      card.append(npc);
      speak(t.npc.hy);
    }

    // Consegna: cosa deve fare lo studente (specie quando apre lui)
    card.append(el('p', { class: 'task-prompt' }, (t.studentFirst ? '👉 ' : '') + t.prompt));

    const opts = el('div', { style: 'display:grid;gap:10px;margin-top:8px' });
    let answered = false;

    // Opzioni di risposta (sempre in armeno)
    const choices = shuffle(t.options.slice());
    for (const o of choices) {
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
                scaffold !== 'none' && o.reply.it ? el('div', { class: 'w-it', style: 'color:var(--ink-soft);font-size:.85rem' }, o.reply.it) : null)));
            speak(o.reply.hy);
          }
          card.append(el('button', { class: 'btn btn-block', style: 'margin-top:14px', onclick: () => {
            turnIdx++;
            if (turnIdx >= step.turns.length) renderDone();
            else renderPlay();
          } }, 'Continua →'));
        } else {
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

    // Communication repair: un pulsante "Non ho capito" sempre disponibile in questo turno
    if (t.repair) {
      const rep = el('button', { class: 'task-repair', onclick: () => {
        speak(t.repair.hy);
        rep.disabled = true;
        opts.before(el('div', { class: 'task-npc task-npc-reply' },
          el('div', { class: 'task-npc-av' }, '🧑‍🌾'),
          el('div', {}, el('div', { class: 'hy', lang: 'hy' }, t.repair.hy),
            scaffold !== 'none' && t.repair.it ? el('div', { class: 'w-it', style: 'color:var(--ink-soft);font-size:.85rem' }, t.repair.it) : null)));
      } }, '🙋 «Չհասկացա» — Non ho capito');
      card.append(rep);
    }
    wrap.append(card);
  }

  // ---------- FASE 3: debrief ----------
  function renderDone() {
    wrap.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.append(el('div', { style: 'text-align:center;font-size:2.4rem' }, stumbles === 0 ? '🏆' : '✅'),
      el('h2', { style: 'text-align:center' }, 'Missione compiuta!'),
      el('p', { style: 'text-align:center;color:var(--ink-soft)' },
        stumbles === 0 ? 'Perfetto, senza esitazioni.' : `Ce l'hai fatta (${stumbles} tentativ${stumbles===1?'o':'i'} a vuoto).`));
    // Il debrief (focus on form) si mostra pieno solo col scaffolding alto; ai livelli alti si accenna
    if (step.debrief && scaffold !== 'none') {
      card.append(el('div', { class: 'task-debrief' },
        el('div', { style: 'font-weight:700;margin-bottom:8px' }, '💡 ' + step.debrief.title),
        ...step.debrief.points.map(p => el('p', { style: 'margin:6px 0;font-size:.92rem' }, '• ' + p))));
    }
    card.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true, stumbles) }, 'Fine')));
    wrap.append(card);
  }

  renderPre();
}
