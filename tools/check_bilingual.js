// tools/check_bilingual.js — verifica che testo armeno e traduzione restino allineati
//
// Le letture mostrano, a fine test, ogni frase armena accanto alla sua traduzione.
// L'allineamento è per posizione: se una revisione tocca solo l'italiano (o solo
// l'armeno) i due testi si sfasano in silenzio e l'accostamento diventa sbagliato.
// Questo controllo lo intercetta.
//
// Uso: node tools/check_bilingual.js
// Exit code 1 se qualcosa non torna.

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'hy', 'lessons');

// Il punto fermo armeno è ։ (U+0589). Il «.» introduce il discorso diretto
// («Նա ասաց. «...»») e NON chiude la frase: non va usato per dividere.
const splitHy = t => t.split(/(?<=։)\s+/).map(x => x.trim()).filter(Boolean);
// In italiano divido dopo . ! ? eventualmente seguiti da virgolette di chiusura,
// così «Quanto costa?». resta una frase sola.
const splitIt = t => t.split(/(?<=[.!?]["»']?)\s+/).map(x => x.trim()).filter(Boolean);

let checked = 0;
const problems = [];

for (const f of fs.readdirSync(DIR).filter(x => x.startsWith('reading_') && x.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const step = doc.steps && doc.steps[0];
  if (!step || !step.it || step.type !== 'reading_test') continue;

  checked++;
  const hy = splitHy(step.text);
  const it = splitIt(step.it);

  if (hy.length !== it.length) {
    problems.push({ id: doc.id, hy: hy.length, it: it.length });
    continue;
  }

  // Controllo grossolano di proporzione: una frase armena di 12 parole tradotta
  // con 2 parole (o viceversa) è quasi sempre un allineamento slittato.
  for (let i = 0; i < hy.length; i++) {
    const a = hy[i].split(/\s+/).length;
    const b = it[i].split(/\s+/).length;
    if (a >= 5 && b >= 5 && (a / b > 3 || b / a > 3)) {
      problems.push({ id: doc.id, riga: i, hy: hy[i].slice(0, 40), it: it[i].slice(0, 40) });
    }
  }
}

console.log(`Letture con traduzione controllate: ${checked}`);
if (!problems.length) {
  console.log('Tutte allineate frase per frase ✓');
  process.exit(0);
}
for (const p of problems) {
  if (p.riga === undefined) {
    console.log(`✗ ${p.id}: ${p.hy} frasi armene, ${p.it} italiane`);
  } else {
    console.log(`✗ ${p.id} riga ${p.riga}: lunghezze molto diverse`);
    console.log(`    hy: ${p.hy}…`);
    console.log(`    it: ${p.it}…`);
  }
}
console.log(`\n${problems.length} PROBLEMI`);
process.exit(1);
