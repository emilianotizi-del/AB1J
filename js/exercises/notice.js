// Avviso informativo dentro una lezione (non valutato).
// step: { title?, text, icon? }
// Uso previsto dal syllabus: in testa alle lezioni B1 con correzione via API,
// per avvisare che la funzione è opzionale e richiede una chiave dell'utente.
import { el } from '../utils/dom.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card', style: 'text-align:center;padding:24px 16px' });
  card.append(
    el('div', { style: 'font-size:2.2rem' }, step.icon || 'ℹ️'),
    step.title ? el('h2', { style: 'margin-top:8px' }, step.title) : null,
    el('p', { style: 'margin-top:10px;color:var(--ink-soft)' }, step.text));
  mount.append(card,
    el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true) }, 'Ho capito')));
}
