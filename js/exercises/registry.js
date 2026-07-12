// Ogni esercizio è un plugin che espone render(step, mount, ctx).
// ctx: { onDone(correct:boolean), letter(glyph) → dati lettera }
// Per aggiungere un tipo nuovo: creare il modulo e registrarlo qui.
import * as teach from './teach.js';
import * as mcq from './mcq.js';
import * as match from './match.js';
import * as trace from './trace.js';
import * as dictation from './dictation.js';
import * as order from './order.js';
import * as dialog from './dialog.js';
import * as reading from './reading.js';
import * as notice from './notice.js';
import * as cloze from './cloze.js';
import * as conjugate from './conjugate.js';

const types = { teach, mcq, match, trace, dictation, order, dialog, reading, notice, cloze, conjugate };

// Tipi che presentano contenuto senza valutare l'utente
export const UNGRADED = new Set(['teach', 'dialog', 'reading', 'notice']);

export function renderStep(step, mount, ctx) {
  const mod = types[step.type];
  if (!mod) throw new Error('Tipo di esercizio sconosciuto: ' + step.type);
  mount.innerHTML = '';
  const area = document.createElement('div');
  area.className = 'step-area';
  mount.append(area);
  mod.render(step, area, ctx);
}
