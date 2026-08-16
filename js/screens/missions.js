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

  // Ordino per modulo di sblocco (m06 < m08 < m11 …); a parità, mantengo l'ordine del registro.
  const modNum = id => parseInt(String(id).replace(/\D/g, ''), 10) || 0;
  const ordered = data.missions
    .map((m, i) => ({ m, i }))
    .sort((a, b) => modNum(a.m.after) - modNum(b.m.after) || a.i - b.i)
    .map(x => x.m);

  // Assegno la sigla: M8 se unica sul modulo, M8a/M8b/… se più d'una.
  const byMod = {};
  for (const m of ordered) (byMod[m.after] = byMod[m.after] || []).push(m);
  const codeOf = {};
  for (const [mod, list] of Object.entries(byMod)) {
    const n = modNum(mod);
    list.forEach((m, idx) => {
      codeOf[m.id] = 'M' + n + (list.length > 1 ? String.fromCharCode(97 + idx) : '');
    });
  }

  for (const m of ordered) {
    const unlocked = moduleCompleted(m.after, course, done);
    const doneKey = 'ab1j_mission_' + m.id;
    let bestStumbles = null;
    try { const v = localStorage.getItem(doneKey); if (v !== null) bestStumbles = parseInt(v, 10); } catch {}
    const played = bestStumbles !== null;

    const card = el('div', { class: 'mission-card' + (unlocked ? '' : ' locked') });
    card.append(
      el('div', { class: 'mission-code' }, codeOf[m.id]),
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
