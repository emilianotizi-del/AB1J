// Coniugatore: tabella delle persone con lacune, forme da piazzare come tessere.
// step: { prompt, stem?, rows: [{label:"ես", answer:"եմ"}, ...], note? }
import { el, shuffle, vibrate } from '../utils/dom.js';

export function render(step, mount, ctx) {
  const card = el('div', { class: 'card' });
  card.append(el('h2', { style: 'text-align:center' }, step.prompt || 'Completa la coniugazione'));
  if (step.note) card.append(el('p', { class: 'teach-note' }, step.note));

  const slots = [];
  const table = el('div', { class: 'conj-table' });
  for (const row of step.rows) {
    const slot = el('button', { class: 'conj-slot hy', lang: 'hy' }, '‒‒‒');
    slot._answer = row.answer;
    slot._tile = null;
    slot.addEventListener('click', () => {
      if (done || !slot._tile) return;
      bank.append(slot._tile);        // rimanda la tessera nella riserva
      slot._tile = null;
      slot.textContent = '‒‒‒';
      slot.classList.remove('conj-filled');
    });
    slots.push(slot);
    table.append(el('div', { class: 'conj-row' },
      el('span', { class: 'conj-pron hy', lang: 'hy' }, row.label),
      step.stem ? el('span', { class: 'hy', lang: 'hy' }, step.stem) : null,
      slot));
  }
  card.append(table);

  const bank = el('div', { class: 'tile-bank' });
  for (const form of shuffle(step.rows.map(r => r.answer))) {
    const t = el('button', { class: 'tile hy', lang: 'hy' }, form);
    t.addEventListener('click', () => {
      if (done || t.parentElement !== bank) return;
      const slot = slots.find(s => !s._tile);
      if (!slot) return;
      slot._tile = t;
      slot.textContent = form;
      slot.classList.add('conj-filled');
      t.remove();                     // esce dalla riserva finché occupa lo slot
      bank.append(...[]);
    });
    bank.append(t);
  }
  card.append(bank);

  let done = false;
  const checkBtn = el('button', { class: 'btn btn-block', style: 'margin-top:16px', onclick: check }, 'Verifica');
  card.append(checkBtn);
  mount.append(card);

  function check() {
    if (done) return;
    if (slots.some(s => !s._tile)) return;   // tabella incompleta
    done = true;
    let errors = 0;
    for (const s of slots) {
      const ok = s.textContent === s._answer;
      s.classList.add(ok ? 'conj-ok' : 'conj-err');
      if (!ok) { errors++; s.textContent = s._answer; }
    }
    checkBtn.remove();
    vibrate(errors ? [60, 40, 60] : 30);
    card.append(el('div', { class: 'feedback ' + (errors ? 'err' : 'ok') },
      errors ? `✗ ${errors} form${errors === 1 ? 'a' : 'e'} corrett${errors === 1 ? 'a' : 'e'} mostrat${errors === 1 ? 'a' : 'e'} in tabella` : '✓ Coniugazione perfetta!'));
    mount.append(el('div', { class: 'lesson-footer' },
      el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(errors === 0) }, 'Avanti')));
  }
}
