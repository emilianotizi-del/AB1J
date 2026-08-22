// tools/check_article.js — articolo determinato davanti a vocale
//
// In armeno orientale l'articolo -ը diventa -ն quando la parola SUCCESSIVA
// inizia per vocale: «Ես տանն եմ», non «Ես տանը եմ».
//
// Questo controllo segnala solo il contesto in cui la regola è fuori discussione
// e il corso stesso la applica: articolo seguito dalla copula (եմ, ես, է, ենք,
// եք, են, էի, էր, էին…). Gli altri contesti — davanti a ու, a numerali, ad
// avverbi come վաղը/ժամը — sono elencati a parte come "da verificare", perché
// l'uso reale è meno univoco e va confermato da un madrelingua.
//
// Uso: node tools/check_article.js
// Exit 1 se ci sono violazioni nel contesto certo.

const fs = require('fs');
const path = require('path');

const LESSONS = path.join(__dirname, '..', 'data', 'hy', 'lessons');
const MISSIONS = path.join(__dirname, '..', 'data', 'hy', 'missions.json');

const COPULA = ['եմ', 'ես', 'է', 'ենք', 'եք', 'են', 'էի', 'էիր', 'էր', 'էինք', 'էիք', 'էին'];
const LET = '\\u0561-\\u0587\\u0531-\\u0556';
const VOW = 'աեէըիոօևու';

const certi = new RegExp(`([${LET}]+)ը\\s+(${COPULA.sort((a, b) => b.length - a.length).join('|')})(?![${LET}])`, 'g');
const tutti = new RegExp(`([${LET}]+)ը\\s+([${VOW}][${LET}]*)`, 'g');

const files = [
  ...fs.readdirSync(LESSONS).filter(f => f.endsWith('.json')).map(f => path.join(LESSONS, f)),
  MISSIONS,
];

const violazioni = [];
const daVerificare = [];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const txt = fs.readFileSync(f, 'utf8');
  const nome = path.basename(f);
  for (const m of txt.matchAll(certi)) violazioni.push(`${nome}: ${m[1]}ը ${m[2]} → ${m[1]}ն ${m[2]}`);
  for (const m of txt.matchAll(tutti)) {
    if (COPULA.includes(m[2])) continue;
    daVerificare.push(`${nome}: ${m[1]}ը ${m[2]}`);
  }
}

if (violazioni.length) {
  console.log(`✗ ${violazioni.length} violazioni certe (articolo + copula):`);
  for (const v of violazioni) console.log('   ' + v);
} else {
  console.log('Articolo + copula: nessuna violazione ✓');
}

console.log(`\nDa verificare con un madrelingua (regola meno univoca): ${daVerificare.length} casi`);
const campione = [...new Set(daVerificare.map(x => x.split(': ')[1]))].slice(0, 12);
for (const c of campione) console.log('   ' + c);
if (daVerificare.length > campione.length) console.log('   …');

process.exit(violazioni.length ? 1 : 0);
