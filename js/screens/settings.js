// Impostazioni: tema, traslitterazione/IPA, durata lezione, esporta/importa/azzeramento.
import { el } from '../utils/dom.js';
import { getSettings, saveSettings, exportAll, importAll, resetAll } from '../core/store.js';
import { hasArmenianVoice } from '../core/audio.js';

export function render(mount) {
  const s = getSettings();
  mount.innerHTML = '';
  mount.append(el('div', { class: 'screen-head' }, el('h1', {}, 'Opzioni')));

  const card = el('div', { class: 'card' });

  function toggle(label, key) {
    const input = el('input', { type: 'checkbox', ...(s[key] ? { checked: '' } : {}) });
    input.addEventListener('change', () => { s[key] = input.checked; saveSettings(s); });
    return el('div', { class: 'setting-row' },
      el('span', {}, label),
      el('label', { class: 'switch' }, input, el('span', { class: 'knob' })));
  }

  // Tema
  const themeInput = el('input', { type: 'checkbox', ...(s.theme === 'dark' ? { checked: '' } : {}) });
  themeInput.addEventListener('change', () => { s.theme = themeInput.checked ? 'dark' : 'light'; saveSettings(s); });
  card.append(el('div', { class: 'setting-row' },
    el('span', {}, 'Tema scuro'),
    el('label', { class: 'switch' }, themeInput, el('span', { class: 'knob' }))));

  card.append(toggle('Mostra traslitterazione', 'showTr'));
  card.append(toggle('Mostra IPA', 'showIpa'));

  // Durata lezione
  const seg = el('div', { class: 'seg' });
  for (const d of [30, 10]) {
    const b = el('button', { class: s.duration === d ? 'active' : '' }, d + ' min');
    b.addEventListener('click', () => {
      s.duration = d; saveSettings(s);
      [...seg.children].forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
    seg.append(b);
  }
  card.append(el('div', { class: 'setting-row' }, el('span', {}, 'Durata lezione'), seg));

  mount.append(card);

  // Dati
  const dataCard = el('div', { class: 'card', style: 'margin-top:14px' });
  dataCard.append(el('h2', { style: 'margin-bottom:10px' }, 'I tuoi dati'));
  dataCard.append(el('p', { style: 'font-size:.85rem;color:var(--ink-soft);margin-bottom:12px' },
    'Il progresso è salvato solo su questo dispositivo. Esporta un backup prima di cambiare telefono o svuotare il browser.'));

  const row = el('div', { style: 'display:grid;gap:10px' });
  row.append(el('button', {
    class: 'btn btn-secondary btn-block', onclick: () => {
      const blob = new Blob([exportAll()], { type: 'application/json' });
      const a = el('a', { href: URL.createObjectURL(blob), download: 'ab1j-progresso.json' });
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }, '⬇️ Esporta progresso'));

  const fileInput = el('input', { type: 'file', accept: 'application/json', style: 'display:none' });
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files[0];
    if (!f) return;
    try {
      importAll(await f.text());
      alert('Progresso importato. La pagina verrà ricaricata.');
      location.reload();
    } catch { alert('File non valido.'); }
  });
  row.append(fileInput, el('button', {
    class: 'btn btn-secondary btn-block', onclick: () => fileInput.click()
  }, '⬆️ Importa progresso'));

  row.append(el('button', {
    class: 'btn btn-block', style: 'background:var(--err)', onclick: () => {
      if (confirm('Azzerare tutto il progresso? L\u2019operazione non si può annullare.')) {
        resetAll();
        location.reload();
      }
    }
  }, '🗑️ Azzera tutto'));
  dataCard.append(row);
  mount.append(dataCard);

  // Nota sull'audio
  if (!hasArmenianVoice()) {
    mount.append(el('p', { style: 'margin-top:14px;font-size:.8rem;color:var(--ink-soft)' },
      'Nota: su questo dispositivo non è installata una voce armena per la sintesi vocale. ' +
      'Su Android: Impostazioni → Sistema → Lingua → Output sintesi vocale → aggiungi l\u2019armeno.'));
  }
}
