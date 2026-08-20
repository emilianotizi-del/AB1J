// Schermata Missioni: compiti comunicativi (task) e letture (reading), con sblocco rigido.
// task → sblocco per MODULO (after: mNN), sigla M<n>[a/b…]
// reading → sblocco per LEZIONE (after: lNNN), sigla L<nn>
import { el } from '../utils/dom.js';
import { getMissions, getCourse } from '../core/data.js';
import { getCompleted } from '../core/store.js';

const num = id => parseInt(String(id).replace(/\D/g, ''), 10) || 0;

function moduleCompleted(modId, course, done) {
  const mod = course.modules.find(m => m.id === modId);
  if (!mod) return false;
  return mod.lessons.every(l => done.includes(l.id));
}
function lessonCompleted(lessonId, done) {
  return done.includes(lessonId);
}
// Per ordinare: una lettura Lxx "vale" come il modulo che contiene quella lezione
function moduleOfLesson(lessonId, course) {
  for (const m of course.modules) if (m.lessons.some(l => l.id === lessonId)) return m;
  return null;
}

export async function render(mount) {
  const data = await getMissions();
  const course = await getCourse();
  const done = getCompleted();
  mount.innerHTML = '';

  mount.append(el('h1', { class: 'screen-title' }, 'Missioni'));
  mount.append(el('p', { style: 'color:var(--ink-soft);margin-bottom:16px' },
    'Situazioni reali (🎯) e letture (📖) per usare e verificare l\u2019armeno che impari. Si sbloccano avanzando nel corso.'));

  // Valore d'ordine: per i task = numero modulo; per le letture = numero del modulo che contiene la lezione
  const orderVal = m => {
    if (m.kind === 'reading') {
      const mod = moduleOfLesson(m.after, course);
      return mod ? num(mod.id) + 0.5 : 999;   // +0.5: la lettura viene dopo le missioni dello stesso modulo
    }
    return num(m.after);
  };

  const ordered = data.missions
    .map((m, i) => ({ m, i }))
    .sort((a, b) => orderVal(a.m) - orderVal(b.m) || a.i - b.i)
    .map(x => x.m);

  // Sigle: task = M<n>[a/b…] per modulo; reading = L<nn> (numero lezione)
  const codeOf = {};
  const byMod = {};
  for (const m of ordered) if (m.kind !== 'reading') (byMod[m.after] = byMod[m.after] || []).push(m);
  for (const [mod, list] of Object.entries(byMod)) {
    const n = num(mod);
    list.forEach((m, idx) => { codeOf[m.id] = 'M' + n + (list.length > 1 ? String.fromCharCode(97 + idx) : ''); });
  }
  for (const m of ordered) if (m.kind === 'reading') codeOf[m.id] = 'L' + num(m.after);

  for (const m of ordered) {
    const isReading = m.kind === 'reading';
    const unlocked = isReading ? lessonCompleted(m.after, done) : moduleCompleted(m.after, course, done);
    const doneKey = 'ab1j_mission_' + m.id;
    let played = false;
    try { played = localStorage.getItem(doneKey) !== null; } catch {}

    const card = el('div', { class: 'mission-card' + (unlocked ? '' : ' locked') + (isReading ? ' reading-card' : '') });
    card.append(
      el('div', { class: 'mission-code' + (isReading ? ' code-reading' : '') }, codeOf[m.id]),
      el('div', { class: 'mission-icon' }, unlocked ? m.icon : '🔒'),
      el('div', { class: 'mission-meta' },
        el('div', { class: 'mission-title' }, m.title),
        el('div', { class: 'mission-area' }, m.area + (played ? ' · ✓ fatto' : ''))));

    if (unlocked) {
      card.style.cursor = 'pointer';
      card.onclick = () => { location.hash = '#/mission/' + m.id; };
    } else {
      let need;
      if (isReading) {
        const mod = moduleOfLesson(m.after, course);
        const lesson = mod && mod.lessons.find(l => l.id === m.after);
        need = 'Completa la lezione' + (lesson ? ' «' + lesson.title + '»' : '');
      } else {
        const mod = course.modules.find(x => x.id === m.after);
        need = 'Completa: ' + (mod ? mod.title : m.after);
      }
      card.append(el('div', { class: 'mission-lock-hint' }, need));
    }
    mount.append(card);
  }
}
