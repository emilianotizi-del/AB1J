// Gioca una singola missione. Gestisce il replay a scaffolding decrescente.
import { el } from '../utils/dom.js';
import { getMissions, getLesson } from '../core/data.js';
import { renderStep } from '../exercises/registry.js';
import { navigate } from '../core/router.js';

export async function render(mount, params) {
  const data = await getMissions();
  const meta = data.missions.find(m => m.id === params.id);
  if (!meta) { navigate('/missions'); return; }

  const isReading = meta.kind === 'reading';
  // Le letture hanno file reading_<id>.json (l'id è già "reading_lNNN");
  // i task hanno file mission_<id>.json.
  const lesson = await getLesson(isReading ? meta.id : 'mission_' + meta.id);
  mount.innerHTML = '';

  const doneKey = 'ab1j_mission_' + meta.id;
  let played = false;
  try { played = localStorage.getItem(doneKey) !== null; } catch {}

  // Scelta del livello (replay): la prima volta parte guidata; poi si può alzare la sfida
  const top = el('div', { class: 'lesson-top' },
    el('button', { class: 'btn-ghost', 'aria-label': 'Esci', onclick: () => navigate('/missions') }, '✕'),
    el('div', { class: 'progress' }, el('div', { style: 'width:100%' })));
  const area = el('div', {});
  mount.append(top, area);

  function start(scaffold) {
    area.innerHTML = '';
    const ctx = {
      scaffold,
      onDone(ok, stumbles) {
        try {
          const prev = localStorage.getItem(doneKey);
          const best = prev === null ? stumbles : Math.min(parseInt(prev, 10), stumbles);
          localStorage.setItem(doneKey, String(best));
        } catch {}
        navigate('/missions');
      }
    };
    renderStep(lesson.steps[0], area, ctx);
    window.scrollTo({ top: 0 });
  }

  // Le letture non hanno livelli di scaffolding: partono dirette.
  if (played && !isReading) {
    area.append(el('div', { class: 'card' },
      el('h2', { style: 'text-align:center' }, meta.icon + ' ' + meta.title),
      el('p', { style: 'text-align:center;color:var(--ink-soft);margin:8px 0 16px' },
        'L\u2019hai gi\u00e0 completata. Rigiocala con meno aiuti per allenarti sul serio.'),
      el('div', { style: 'display:grid;gap:10px' },
        el('button', { class: 'btn btn-block', onclick: () => start('full') }, '🟢 Guidata (tutti gli aiuti)'),
        el('button', { class: 'btn btn-block', onclick: () => start('light') }, '🟡 Meno aiuti'),
        el('button', { class: 'btn btn-block', onclick: () => start('none') }, '🔴 In autonomia (immersione)'))));
  } else {
    start('full');
  }
}
