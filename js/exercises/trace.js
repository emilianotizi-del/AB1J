// Pratica di scrittura: si ricalca il glifo mostrato in filigrana sul canvas.
// Verifica per copertura: percentuale di pixel del glifo toccati dal tratto.
// step: { letter, form? ('upper'|'lower', default 'upper') }
import { el, vibrate } from '../utils/dom.js';
import { speak } from '../core/audio.js';

const SIZE = 480;          // risoluzione interna del canvas
const PASS = 0.55;         // soglia di copertura per superare

export async function render(step, mount, ctx) {
  const L = await ctx.letter(step.letter);
  const glyph = step.form === 'lower' ? L.lower : L.upper;

  const card = el('div', { class: 'card trace-wrap' });
  card.append(el('h2', {}, `Scrivi la lettera «${L.name}»`));

  const canvas = el('canvas', { class: 'trace-canvas', width: SIZE, height: SIZE });
  const g = canvas.getContext('2d');

  // Filigrana del glifo
  function drawGuide() {
    g.clearRect(0, 0, SIZE, SIZE);
    g.save();
    g.fillStyle = getComputedStyle(document.body).getPropertyValue('--line') || '#ddd';
    g.font = `700 ${SIZE * 0.72}px "Noto Serif Armenian", serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);
    g.restore();
  }
  drawGuide();

  // Maschera del glifo per il calcolo della copertura
  const mask = document.createElement('canvas');
  mask.width = mask.height = SIZE;
  const mg = mask.getContext('2d', { willReadFrequently: true });
  mg.fillStyle = '#000';
  mg.font = g.font = `700 ${SIZE * 0.72}px "Noto Serif Armenian", serif`;
  mg.textAlign = 'center';
  mg.textBaseline = 'middle';
  await document.fonts.load(mg.font, glyph).catch(() => {});
  drawGuide();
  mg.fillText(glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);

  // Tratto dell'utente
  const strokes = document.createElement('canvas');
  strokes.width = strokes.height = SIZE;
  const sg = strokes.getContext('2d', { willReadFrequently: true });
  sg.lineWidth = SIZE * 0.07;
  sg.lineCap = sg.lineJoin = 'round';
  sg.strokeStyle = '#8E2A3C';

  let drawing = false;
  function pos(ev) {
    const r = canvas.getBoundingClientRect();
    return [(ev.clientX - r.left) * SIZE / r.width, (ev.clientY - r.top) * SIZE / r.height];
  }
  canvas.addEventListener('pointerdown', ev => {
    drawing = true;
    canvas.setPointerCapture(ev.pointerId);
    const [x, y] = pos(ev);
    sg.beginPath();
    sg.moveTo(x, y);
    sg.lineTo(x + 0.1, y + 0.1);
    sg.stroke();
    repaint();
  });
  canvas.addEventListener('pointermove', ev => {
    if (!drawing) return;
    const [x, y] = pos(ev);
    sg.lineTo(x, y);
    sg.stroke();
    repaint();
  });
  canvas.addEventListener('pointerup', () => { drawing = false; });

  function repaint() {
    drawGuide();
    g.drawImage(strokes, 0, 0);
  }

  function coverage() {
    const m = mg.getImageData(0, 0, SIZE, SIZE).data;
    const s = sg.getImageData(0, 0, SIZE, SIZE).data;
    let glyphPx = 0, hit = 0;
    for (let i = 3; i < m.length; i += 4) {
      if (m[i] > 60) {
        glyphPx++;
        if (s[i] > 60) hit++;
      }
    }
    return glyphPx ? hit / glyphPx : 0;
  }

  const actions = el('div', { style: 'display:flex;gap:10px;width:100%' },
    el('button', {
      class: 'btn btn-secondary', style: 'flex:1', onclick: () => {
        sg.clearRect(0, 0, SIZE, SIZE);
        repaint();
        result.textContent = '';
        result.className = '';
      }
    }, 'Cancella'),
    el('button', { class: 'btn-audio', 'aria-label': 'Ascolta', onclick: () => speak(L.lower) }, '🔊'),
    el('button', {
      class: 'btn', style: 'flex:1', onclick: () => {
        const c = coverage();
        const ok = c >= PASS;
        result.className = 'feedback ' + (ok ? 'ok' : 'err');
        result.textContent = ok ? '✓ Ottimo tratto!' : '✗ Ricalca meglio la lettera e riprova';
        vibrate(ok ? 30 : [60, 40, 60]);
        if (ok && !done) {
          done = true;
          mount.append(el('div', { class: 'lesson-footer' },
            el('button', { class: 'btn btn-block', onclick: () => ctx.onDone(true) }, 'Avanti')));
        }
      }
    }, 'Verifica'));

  let done = false;
  const result = el('div', {});
  card.append(canvas, actions, result);
  mount.append(card);
}
