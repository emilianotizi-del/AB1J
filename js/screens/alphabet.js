// Alfabeto: griglia delle 39 lettere. Le lettere già incontrate sono evidenziate.
// Tocco su una lettera → dettaglio con audio e pratica di scrittura.
import { el } from '../utils/dom.js';
import { getAlphabet, getCourse, getLetter, getLetterExamples, getLetterGloss } from '../core/data.js';
import { getCompleted } from '../core/store.js';
import { speak } from '../core/audio.js';
import { renderStep } from '../exercises/registry.js';

export async function render(mount) {
  const alpha = await getAlphabet();
  const course = await getCourse();
  const done = getCompleted();
  const examplesData = await getLetterExamples();
  const gloss = await getLetterGloss();

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

  function buildExamples(L) {
    const info = examplesData.letters[L.upper];
    if (!info) return null;
    const wrap = el('div', { style: 'margin-top:16px;text-align:left' });

    // Parole con questa lettera
    if (info.examples?.length) {
      wrap.append(el('div', {
        style: 'font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:6px'
      }, 'Parole con questa lettera'));
      for (const w of info.examples) {
        wrap.append(el('button', {
          class: 'ex-word', 'aria-label': 'Ascolta ' + w, onclick: () => speak(w)
        },
          el('span', { class: 'hy', lang: 'hy', style: 'font-size:1.15rem;font-weight:600' }, w),
          gloss[w] ? el('span', { style: 'color:var(--ink-soft);margin-left:8px;font-size:.9rem' }, gloss[w]) : null,
          el('span', { style: 'margin-left:auto;opacity:.5' }, '🔊')));
      }
    }

    // Avviso "non confondere" + coppia minima
    if (info.confuse?.length) {
      const box = el('div', { class: 'confuse-box' });
      box.append(el('div', { style: 'font-weight:600;margin-bottom:4px' },
        '⚠️ Non confondere con ' + info.confuse.map(c => {
          const o = alpha.letters.find(x => x.upper === c);
          return o ? `${o.upper} ${o.lower} (${o.tr})` : c;
        }).join(', ')));
      if (info.minpair) {
        const [a, b] = info.minpair;
        box.append(el('div', { style: 'display:flex;gap:12px;align-items:center;margin-top:8px' },
          el('button', { class: 'minpair-chip', onclick: () => speak(a) },
            el('span', { class: 'hy', lang: 'hy' }, a), ' 🔊'),
          el('span', { style: 'color:var(--ink-soft)' }, 'vs'),
          el('button', { class: 'minpair-chip', onclick: () => speak(b) },
            el('span', { class: 'hy', lang: 'hy' }, b), ' 🔊')));
        box.append(el('div', { style: 'font-size:.8rem;color:var(--ink-soft);margin-top:6px' },
          'Ascolta la differenza: cambia solo questa lettera.'));
      }
      wrap.append(box);
    }
    return wrap;
  }

  function openDetail(L) {
    const backdrop = el('div', { class: 'modal-backdrop', onclick: e => { if (e.target === backdrop) backdrop.remove(); } });
    const modal = el('div', { class: 'modal letter-detail' },
      el('div', { class: 'big-glyph', lang: 'hy' }, `${L.upper} ${L.lower}`),
      el('h2', {}, `«${L.name}»`),
      el('p', {}, `suono ${L.ipa} · traslitterazione “${L.tr}”`),
      L.note ? el('p', { class: 'teach-note' }, L.note) : null,
      buildExamples(L),
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
