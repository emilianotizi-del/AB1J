#!/usr/bin/env node
// Linter di coerenza dei contenuti. Regole:
// - ogni parola usa solo lettere già insegnate (il digramma ու conta come unità;
//   le frasi-blocco delle lezioni "exempt" sono riusabili in seguito, per intero
//   o come singole parole);
// - risposte MCQ tra le opzioni, senza duplicati; abbinamenti non ambigui;
// - distrattori del dettato validi e non già presenti nella parola;
// - segnalazione dei testi senza traccia audio (li genererà l'Action).
const fs = require('fs');
const alpha = JSON.parse(fs.readFileSync('data/hy/alphabet.json'));
const course = JSON.parse(fs.readFileSync('data/hy/course.json'));
const audioIdx = fs.existsSync('data/hy/audio/index.json')
  ? JSON.parse(fs.readFileSync('data/hy/audio/index.json')) : {};
const EXEMPT = new Set(['l005']);   // lezioni che insegnano frasi come blocchi

const lowerOf = {}; alpha.letters.forEach(l => { lowerOf[l.upper] = l.lower; });
(alpha.digraphs || []).forEach(l => { lowerOf[l.upper] = l.lower; });
const allGlyphs = new Set(Object.values(lowerOf).concat(Object.keys(lowerOf)));
const types = new Set(['teach', 'mcq', 'match', 'trace', 'dictation', 'order', 'dialog', 'reading', 'notice', 'cloze', 'conjugate', 'write', 'listen']);

let errors = 0;
const err = m => { console.log('✗', m); errors++; };
const noAudio = new Set();
const taught = new Set();
const chunks = new Set();           // parole/frasi apprese come blocchi

function readable(hy) {
  let s = hy.toLowerCase().replace(/[՞՜՛։,]/g, '');
  for (const w of s.split(' ')) if (chunks.has(w)) s = s.replace(w, '');
  if (taught.has('ու')) s = s.replace(/ու/g, '');
  return [...new Set(Array.from(s.replace(/ /g, '')))]
    .filter(ch => /[\u0531-\u058F]/.test(ch) && !taught.has(ch));
}

for (const mod of course.modules) {
  for (const les of mod.lessons) {
    const L = JSON.parse(fs.readFileSync(`data/hy/lessons/${les.id}.json`));
    if (L.id !== les.id) err(`${les.id}: id incoerente`);
    (les.letters || []).forEach(u => {
      if (!lowerOf[u]) err(`${les.id}: lettera ${u} sconosciuta`);
      else taught.add(lowerOf[u]);
    });
    const exempt = EXEMPT.has(les.id);
    const check = (hy, where) => {
      if (exempt) return;
      const missing = readable(hy);
      if (missing.length) err(`${les.id} ${where}: «${hy}» usa ${missing.join(' ')} non ancora insegnat*`);
    };
    for (const w of L.vocab || []) check(w.hy, 'vocab');
    L.steps.forEach((s, i) => {
      if (!types.has(s.type)) err(`${les.id} passo ${i}: tipo sconosciuto ${s.type}`);
      if (s.word) { check(s.word.hy, `passo ${i}`); const sp = s.word.speak || s.word.hy; if (!audioIdx[sp]) noAudio.add(sp); }
      if (s.type === 'teach' && s.kind === 'letter' && !allGlyphs.has(s.ref)) err(`${les.id} passo ${i}: ref ${s.ref} non in alfabeto`);
      if (s.type === 'trace' && !allGlyphs.has(s.letter)) err(`${les.id} passo ${i}: letter ${s.letter} non in alfabeto`);
      if (s.type === 'mcq') {
        if (!s.options.includes(s.answer)) err(`${les.id} passo ${i}: answer non tra le options`);
        if (new Set(s.options).size !== s.options.length) err(`${les.id} passo ${i}: options duplicate`);
      }
      if (s.type === 'match' && new Set(s.pairs.map(p => p[1])).size !== s.pairs.length) err(`${les.id} passo ${i}: abbinamento ambiguo`);
      if (s.type === 'dictation') for (const d of s.distractors || []) {
        if (!allGlyphs.has(d)) err(`${les.id} passo ${i}: distrattore ${d} non in alfabeto`);
        if (Array.from(s.word.hy.toLowerCase()).includes(d)) err(`${les.id} passo ${i}: distrattore ${d} già nella parola`);
      }
      if (s.type === 'order') {
        if (!Array.isArray(s.tokens) || s.tokens.length < 2) err(`${les.id} passo ${i}: tokens insufficienti`);
        check(s.tokens.join(' '), `passo ${i} (order)`);
      }
      if (s.type === 'cloze') {
        if (!s.text.includes('___')) err(`${les.id} passo ${i}: cloze senza ___`);
        if (!s.options.includes(s.answer)) err(`${les.id} passo ${i}: answer non tra le options`);
        check(s.text.replace('___', s.answer), `passo ${i} (cloze)`);
      }
      if (s.type === 'write') {
        if (!s.answer) err(`${les.id} passo ${i}: write senza answer`);
        else check(s.answer, `passo ${i} (write)`);
        if (s.speakText && !audioIdx[s.speakText]) noAudio.add(s.speakText);
      }
      if (s.type === 'listen') {
        if (!s.speakText) err(`${les.id} passo ${i}: listen senza speakText`);
        else { check(s.speakText, `passo ${i} (listen)`); if (!audioIdx[s.speakText]) noAudio.add(s.speakText); }
      }
      if (s.type === 'conjugate') {
        if (!Array.isArray(s.rows) || s.rows.length < 2) err(`${les.id} passo ${i}: conjugate con meno di 2 righe`);
        if (new Set((s.rows || []).map(r => r.answer)).size !== (s.rows || []).length) err(`${les.id} passo ${i}: forme duplicate (slot ambigui)`);
      }
      if (s.speakText && !audioIdx[s.speakText]) noAudio.add(s.speakText);
      for (const l of s.lines || []) { check(l.hy, `passo ${i} (dialogo)`); if (!audioIdx[l.hy]) noAudio.add(l.hy); }
      for (const x of s.sentences || []) { check(x.hy, `passo ${i} (lettura)`); if (!audioIdx[x.hy]) noAudio.add(x.hy); }
    });
    if (exempt) for (const w of L.vocab || []) {
      chunks.add(w.hy.toLowerCase());
      w.hy.toLowerCase().split(' ').forEach(t => chunks.add(t));
    }
    const core = L.steps.filter(x => !x.extra).length;
    console.log(`✓ ${les.id}: ${L.steps.length} passi (${core} core), ${(L.vocab || []).length} parole`);
  }
}
console.log(`\nLettere insegnate: ${taught.size} (digramma incluso)`);
console.log(`Testi senza audio (li genererà l'Action): ${noAudio.size}`);

// Controllo missioni task-based: caratteri latini nei campi armeni
const missionFiles = fs.readdirSync('data/hy/lessons').filter(f => f.startsWith('mission_'));
for (const mf of missionFiles) {
  const M = JSON.parse(fs.readFileSync(`data/hy/lessons/${mf}`));
  const hyFields = [];
  for (const st of M.steps || []) {
    for (const ph of (st.pretask?.phrases || [])) hyFields.push(ph.hy);
    for (const t of (st.turns || [])) {
      if (t.npc?.hy) hyFields.push(t.npc.hy);
      if (t.repair?.hy) hyFields.push(t.repair.hy);
      for (const o of (t.options || [])) { if (o.hy) hyFields.push(o.hy); if (o.reply?.hy) hyFields.push(o.reply.hy); }
    }
  }
  for (const h of hyFields) {
    if (/[a-zA-Z]/.test(h)) err(`${mf}: carattere latino nel testo armeno → "${h}"`);
  }
}

console.log(errors ? errors + ' ERRORI' : 'Coerenza OK');
process.exit(errors ? 1 : 0);
