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

  const hero = el('div', { class: 'hero' },
    el('div', { class: 'hero-glyph', 'aria-hidden': 'true' }, 'Ձ'),
    el('div', { class: 'hero-kicker' }, 'Armeno orientale · verso il B1'),
    el('h1', {}, 'Բարի գալուստ'),
    el('div', { class: 'hero-sub' },
      `${done.length} lezioni completate · streak di ${streak} giorn${streak === 1 ? 'o' : 'i'}` +
      (due ? ` · ${due} carte da ripassare` : '')));
  mount.append(hero);

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
