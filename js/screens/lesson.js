// Player della lezione: sequenza di passi, barra di avanzamento, riepilogo finale.
import { el } from '../utils/dom.js';
import { getLesson, getLetter } from '../core/data.js';
import { getSettings, markCompleted } from '../core/store.js';
import { addCards } from '../core/srs.js';
import { renderStep } from '../exercises/registry.js';
import { navigate } from '../core/router.js';

export async function render(mount, params) {
  const lesson = await getLesson(params.id);
  const settings = getSettings();

  // Modalità 10 minuti: si saltano i passi marcati "extra".
  const steps = settings.duration === 10
    ? lesson.steps.filter(s => !s.extra)
    : lesson.steps;

  let i = 0;
  let correct = 0;
  let evaluated = 0;

  mount.innerHTML = '';
  const bar = el('div', { class: 'progress' }, el('div', { style: 'width:0%' }));
  const top = el('div', { class: 'lesson-top' },
    el('button', {
      class: 'btn-ghost', 'aria-label': 'Esci dalla lezione',
      onclick: () => { if (confirm('Uscire dalla lezione? I progressi del passo corrente andranno persi.')) navigate('/home'); }
    }, '✕'),
    bar);
  const area = el('div', {});
  mount.append(top, area);

  const ctx = {
    letter: getLetter,
    onDone(ok) {
      if (steps[i].type !== 'teach') {
        evaluated++;
        if (ok) correct++;
      }
      i++;
      next();
    }
  };

  function next() {
    bar.firstChild.style.width = Math.round(i / steps.length * 100) + '%';
    if (i >= steps.length) return finish();
    renderStep(steps[i], area, ctx);
    window.scrollTo({ top: 0 });
  }

  function finish() {
    markCompleted(lesson.id);
    if (lesson.vocab?.length) {
      addCards(lesson.vocab.map(w => ({ id: lesson.id + ':' + w.hy, ...w })));
    }
    const pct = evaluated ? Math.round(correct / evaluated * 100) : 100;
    area.innerHTML = '';
    area.append(el('div', { class: 'lesson-done' },
      el('div', { class: 'done-glyph' }, pct >= 80 ? '🏆' : '👏'),
      el('h2', {}, 'Lezione completata!'),
      el('p', {}, `Risposte corrette: ${pct}%`),
      lesson.vocab?.length
        ? el('p', { style: 'color:var(--ink-soft);font-size:.9rem;margin-top:6px' },
            `${lesson.vocab.length} parole aggiunte al ripasso`)
        : null,
      el('div', { style: 'margin-top:24px;display:grid;gap:10px' },
        el('a', { class: 'btn btn-block', href: '#/home' }, 'Torna al corso'),
        el('a', { class: 'btn btn-secondary btn-block', href: '#/review' }, 'Vai al ripasso'))));
    bar.firstChild.style.width = '100%';
  }

  next();
}
