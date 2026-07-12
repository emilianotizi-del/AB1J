#!/usr/bin/env node
// Genera i file audio del corso con espeak-ng (voce: armeno orientale).
// Uso: node tools/gen_audio.js
// Output: data/hy/audio/wNNN.mp3 + data/hy/audio/index.json (testo → file).
// Per sostituire una pronuncia con una registrazione umana basta sovrascrivere
// il singolo mp3: nomi e mappa restano invariati.
const fs = require('fs');
const { execSync } = require('child_process');

const texts = new Set();

// Alfabeto: suono di ogni lettera (minuscola) e digrammi
const alpha = JSON.parse(fs.readFileSync('data/hy/alphabet.json'));
for (const L of alpha.letters) texts.add(L.lower);
for (const D of alpha.digraphs || []) texts.add(D.lower);

// Lezioni: vocabolario, parole insegnate, testi con pulsante audio
const course = JSON.parse(fs.readFileSync('data/hy/course.json'));
for (const mod of course.modules) {
  for (const les of mod.lessons) {
    const L = JSON.parse(fs.readFileSync(`data/hy/lessons/${les.id}.json`));
    for (const w of L.vocab || []) texts.add(w.hy);
    for (const s of L.steps) {
      if (s.word) texts.add(s.word.speak || s.word.hy);
      if (s.speakText) texts.add(s.speakText);
    }
  }
}

// Mappa esistente: i testi già generati mantengono il loro file
const idxPath = 'data/hy/audio/index.json';
const index = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath)) : {};
let n = Object.keys(index).length;

for (const t of [...texts].sort()) {
  if (index[t] && fs.existsSync('data/hy/audio/' + index[t])) continue;
  const file = 'w' + String(++n).padStart(3, '0') + '.mp3';
  execSync(`espeak-ng -v hy -s 140 -w /tmp/ab1j.wav ${JSON.stringify(t)}`);
  execSync(`ffmpeg -y -loglevel error -i /tmp/ab1j.wav -ac 1 -ar 24000 -b:a 48k data/hy/audio/${file}`);
  index[t] = file;
  console.log(file, '←', t);
}
fs.writeFileSync(idxPath, JSON.stringify(index, null, 2));
console.log(`\n${Object.keys(index).length} tracce in ${idxPath}`);
