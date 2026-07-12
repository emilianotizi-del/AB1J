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

  // Riconoscimento vocale (opzionale)
  const sttCard = el('div', { class: 'card', style: 'margin-top:14px' });
  sttCard.append(el('h2', { style: 'margin-bottom:8px' }, 'Riconoscimento vocale (opzionale)'));
  sttCard.append(el('p', { style: 'font-size:.85rem;color:var(--ink-soft);margin-bottom:10px' },
    'Con una chiave API ElevenLabs, l\u2019allenamento di pronuncia riconosce ciò che dici ' +
    'anche su iPhone. La chiave resta salvata SOLO su questo dispositivo e l\u2019audio va ' +
    'direttamente a ElevenLabs. Consumo: pochi crediti per clip.'));
  const keyInput = el('input', {
    type: 'password', placeholder: 'Chiave API ElevenLabs',
    value: s ? '' : '', autocomplete: 'off',
    style: 'width:100%;min-height:44px;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--paper);color:var(--ink);font:inherit'
  });
  keyInput.value = getSettings().sttKey || '';
  const keyMsg = el('p', { style: 'font-size:.8rem;margin-top:8px;color:var(--ink-soft)' },
    getSettings().sttKey ? 'Chiave salvata su questo dispositivo.' : '');
  sttCard.append(keyInput,
    el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px' },
      el('button', { class: 'btn', onclick: () => {
        const st = getSettings(); st.sttKey = keyInput.value.trim(); saveSettings(st);
        keyMsg.textContent = st.sttKey ? 'Chiave salvata su questo dispositivo.' : 'Chiave rimossa.';
      } }, 'Salva'),
      el('button', { class: 'btn btn-secondary', onclick: () => {
        const st = getSettings(); st.sttKey = ''; saveSettings(st);
        keyInput.value = ''; keyMsg.textContent = 'Chiave rimossa.';
      } }, 'Rimuovi')),
    keyMsg);
  mount.append(sttCard);

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

  // Nota informativa sull'audio
  mount.append(el('p', { style: 'margin-top:14px;font-size:.8rem;color:var(--ink-soft)' },
    'L\u2019audio delle parole usa tracce incluse nell\u2019app (voce sintetica, funziona anche offline). ' +
    (hasArmenianVoice() ? 'In più, questo dispositivo ha una voce armena di sistema come riserva.' : '')));
}
