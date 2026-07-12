// Alfabeto: griglia delle 39 lettere. Le lettere già incontrate sono evidenziate.
// Tocco su una lettera → dettaglio con audio e pratica di scrittura.
import { el } from '../utils/dom.js';
import { getAlphabet, getCourse, getLetter } from '../core/data.js';
import { getCompleted } from '../core/store.js';
import { speak } from '../core/audio.js';
import { renderStep } from '../exercises/registry.js';

export async function render(mount) {
  const alpha = await getAlphabet();
  const course = await getCourse();
  const done = getCompleted();

  // Lettere apprese = lettere insegnate nelle lezioni completate.
  const known = new Set();
  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      if (done.includes(les.id)) (les.letters || []).forEach(l => known.add(l));
    }
  }

  mount.innerHTML = '';
  mount.append(
    el('div', { class: 'screen-head' }, el('h1', {}, 'Alfabeto armeno')),
    el('p', { style: 'color:var(--ink-soft);margin-bottom:14px;font-size:.9rem' },
      `39 lettere · ${known.size} apprese. Le altre si sbloccano avanzando nel corso, ma puoi già esplorarle.`));

  mount.append(el('a', {
    class: 'btn btn-block', href: '#/sounds', style: 'margin-bottom:14px'
  }, '🔊 Allena i suoni'));

  const grid = el('div', { class: 'alpha-grid' });
  for (const L of alpha.letters) {
    const cell = el('button', {
      class: 'alpha-cell' + (known.has(L.upper) ? ' known' : ''),
      onclick: () => openDetail(L)
    },
      el('span', { class: 'a-glyph', lang: 'hy' }, L.upper + ' ' + L.lower),
      el('span', { class: 'a-tr' }, L.tr));
    grid.append(cell);
  }
  mount.append(grid);

  function openDetail(L) {
    const backdrop = el('div', { class: 'modal-backdrop', onclick: e => { if (e.target === backdrop) backdrop.remove(); } });
    const modal = el('div', { class: 'modal letter-detail' },
      el('div', { class: 'big-glyph', lang: 'hy' }, `${L.upper} ${L.lower}`),
      el('h2', {}, `«${L.name}»`),
      el('p', {}, `suono ${L.ipa} · traslitterazione “${L.tr}”`),
      L.note ? el('p', { class: 'teach-note' }, L.note) : null,
      el('div', { class: 'detail-actions' },
        el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: () => speak(L.lower) }, '🔊'),
        el('button', {
          class: 'btn btn-accent', onclick: () => {
            modal.innerHTML = '';
            renderStep({ type: 'trace', letter: L.upper, form: 'lower' }, modal, {
              letter: getLetter,
              onDone: () => backdrop.remove()
            });
          }
        }, '✍️ ' + L.lower + ' minuscola'),
        el('button', {
          class: 'btn btn-accent', onclick: () => {
            modal.innerHTML = '';
            renderStep({ type: 'trace', letter: L.upper, form: 'upper' }, modal, {
              letter: getLetter,
              onDone: () => backdrop.remove()
            });
          }
        }, '✍️ ' + L.upper + ' maiuscola'),
        el('button', { class: 'btn btn-secondary', onclick: () => backdrop.remove() }, 'Chiudi')));
    backdrop.append(modal);
    document.body.append(backdrop);
  }
}
