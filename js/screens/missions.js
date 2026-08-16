// Schermata Missioni: task-based comunicativi, con sblocco rigido sui moduli completati.
import { el } from '../utils/dom.js';
import { getMissions, getCourse } from '../core/data.js';
import { getCompleted } from '../core/store.js';

function moduleCompleted(modId, course, done) {
  const mod = course.modules.find(m => m.id === modId);
  if (!mod) return false;
  return mod.lessons.every(l => done.includes(l.id));
}

export async function render(mount) {
  const data = await getMissions();
  const course = await getCourse();
  const done = getCompleted();
  mount.innerHTML = '';

  mount.append(el('h1', { class: 'screen-title' }, 'Missioni'));
  mount.append(el('p', { style: 'color:var(--ink-soft);margin-bottom:16px' },
    'Situazioni reali in cui usare l\u2019armeno che hai imparato. Si sbloccano avanzando nel corso.'));

  for (const m of data.missions) {
    const unlocked = moduleCompleted(m.after, course, done);
    const doneKey = 'ab1j_mission_' + m.id;
    let bestStumbles = null;
    try { const v = localStorage.getItem(doneKey); if (v !== null) bestStumbles = parseInt(v, 10); } catch {}
    const played = bestStumbles !== null;

    const card = el('div', { class: 'mission-card' + (unlocked ? '' : ' locked') });
    card.append(
      el('div', { class: 'mission-icon' }, unlocked ? m.icon : '🔒'),
      el('div', { class: 'mission-meta' },
        el('div', { class: 'mission-title' }, m.title),
        el('div', { class: 'mission-area' }, m.area + (played ? ' · ✓ completata' : ''))));

    if (unlocked) {
      card.style.cursor = 'pointer';
      card.onclick = () => { location.hash = '#/mission/' + m.id; };
    } else {
      const mod = course.modules.find(x => x.id === m.after);
      card.append(el('div', { class: 'mission-lock-hint' },
        'Completa: ' + (mod ? mod.title : m.after)));
    }
    mount.append(card);
  }
}
