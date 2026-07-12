// Schermata Corso: elenco moduli e lezioni con stato (fatta / disponibile / bloccata).
import { el } from '../utils/dom.js';
import { getCourse } from '../core/data.js';
import { getCompleted, getStreak } from '../core/store.js';
import { dueCards } from '../core/srs.js';

export async function render(mount) {
  const course = await getCourse();
  const done = getCompleted();
  const streak = getStreak();
  const due = dueCards().length;

  mount.innerHTML = '';

  // Prossima lezione da fare: la prima non completata
  let nextLesson = null;
  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      if (!done.includes(les.id)) { nextLesson = les; break; }
    }
    if (nextLesson) break;
  }

  const hero = el('div', { class: 'hero' },
    el('div', { class: 'hero-glyph', 'aria-hidden': 'true' }, 'Ձ'),
    el('div', { class: 'hero-kicker' }, 'Armeno orientale · verso il B1'),
    el('h1', {}, 'Բարի գալուստ'),
    el('div', { class: 'hero-sub' },
      `${done.length} lezioni completate · streak di ${streak} giorn${streak === 1 ? 'o' : 'i'}` +
      (due ? ` · ${due} carte da ripassare` : '')),
    nextLesson
      ? el('a', { class: 'btn btn-accent', href: '#/lesson/' + nextLesson.id, style: 'margin-top:14px' },
          '▶ Continua: ' + nextLesson.title)
      : el('div', { style: 'margin-top:14px;font-weight:600' }, '🎓 Corso completato!'));
  mount.append(hero);

  mount.append(el('a', {
    class: 'card', href: '#/pronounce',
    style: 'display:flex;align-items:center;gap:12px;margin-bottom:6px;padding:12px 16px'
  },
    el('span', { style: 'font-size:1.5rem' }, '🎙️'),
    el('div', {},
      el('div', { style: 'font-weight:600' }, 'Allenamento di pronuncia'),
      el('div', { style: 'font-size:.82rem;color:var(--ink-soft)' }, 'Parla, ti ascolto — 10 parole dal tuo mazzo'))));

  let unlocked = true; // la prima lezione non completata è disponibile, le successive bloccate
  for (const mod of course.modules) {
    mount.append(el('h2', { class: 'module-title' }, mod.title, el('small', {}, mod.level)));
    for (const les of mod.lessons) {
      const isDone = done.includes(les.id);
      const available = isDone || unlocked;
      if (!isDone && unlocked) unlocked = false;

      const item = el(available ? 'a' : 'div', {
        class: 'lesson-item' + (available ? '' : ' locked'),
        ...(available ? { href: '#/lesson/' + les.id } : {})
      },
        el('div', { class: 'l-glyph', lang: 'hy' }, les.glyph || '·'),
        el('div', { class: 'l-meta' },
          el('div', { class: 'l-title' }, les.title),
          el('div', { class: 'l-sub' }, les.subtitle || '')),
        el('div', { class: 'l-state', 'aria-hidden': 'true' }, isDone ? '✅' : available ? '▶️' : '🔒'));
      mount.append(item);
    }
  }
}
