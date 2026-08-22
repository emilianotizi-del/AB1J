// tools/export_revisione.js — genera il docx da sottoporre a un madrelingua
// Uso: node tools/export_revisione.js  →  /mnt/user-data/outputs/AB1J_revisione_madrelingua.docx

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak,
} = require('docx');

const ROOT = path.join(__dirname, '..');
const LES = path.join(ROOT, 'data', 'hy', 'lessons');
const HY = 'Sylfaen';           // font con buona copertura armena su Word/Mac

const course = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/hy/course.json')));
const missions = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/hy/missions.json')));
const seq = [];
for (const m of course.modules) for (const l of m.lessons) seq.append ? null : seq.push(typeof l === 'string' ? l : l.id);
const posOf = id => seq.indexOf(id) + 1;

const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })], ...opts.p });
const hy = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, font: HY, size: 26, ...opts })],
  spacing: { after: 60 },
});
const it = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, italics: true, color: '555555', size: 20, ...opts })],
  spacing: { after: 160 },
});
const nota = text => new Paragraph({
  children: [new TextRun({ text, size: 18, color: '8A6D00' })],
  spacing: { before: 60, after: 160 },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'E0B400', space: 8 } },
});

// Frasi armene e traduzione, appaiate
const splitHy = t => t.split(/(?<=։)\s+/).map(x => x.trim()).filter(Boolean);
const splitIt = t => t.split(/(?<=[.!?]["»']?)\s+/).map(x => x.trim()).filter(Boolean);

// Tappe grammaticali: servono al revisore per capire perché un testo evita certe forme
const MILESTONES = [
  ['negazione al presente', 'l024n'], ['forme di luogo (blocchi)', 'l026b'],
  ['ունեմ «avere»', 'l036'], ['tutte le persone del verbo', 'l040'],
  ['pronomi obliqui (ինձ, քեզ…)', 'l043p'], ['genitivo', 'l050'], ['dativo', 'l051'],
  ['passato', 'l055'], ['imperfetto', 'l064'], ['futuro', 'l069'],
  ['ablativo', 'l073'], ['strumentale', 'l074'], ['locativo -ում', 'l075'],
  ['comparativo', 'l078'], ['որ e frasi complesse', 'l083'],
  ['բայց, եթե, որովհետև', 'l084'],
];

function vincoliPer(after) {
  const pos = posOf(after);
  const mancanti = MILESTONES.filter(([, id]) => posOf(id) > pos).map(([nome]) => nome);
  return mancanti;
}

const children = [];

// ---------- copertina ----------
children.push(
  new Paragraph({ text: 'AB1J — Materiali da revisionare', heading: HeadingLevel.TITLE }),
  P('Corso di armeno orientale per italofoni (A0 → B1)', { size: 24, color: '555555' }),
  new Paragraph({ text: '', spacing: { after: 200 } }),
  new Paragraph({ text: 'Che cosa chiedo', heading: HeadingLevel.HEADING_2 }),
  P('Segnalare tutto ciò che un armeno non direbbe: errori di grammatica, forme innaturali, ordine delle parole, uso dell’articolo, scelte lessicali improbabili. Anche piccole sfumature sono utili.'),
  new Paragraph({ text: '', spacing: { after: 120 } }),
  new Paragraph({ text: 'Una premessa importante', heading: HeadingLevel.HEADING_2 }),
  P('Questi testi sono scritti sotto un vincolo forte: ogni lettura può usare solo la grammatica e il lessico già insegnati fino a quel punto del corso. Alcune formulazioni sono quindi più povere o più rigide di come le direbbe un madrelingua — non per ignoranza, ma per necessità didattica.'),
  P('Per questo ogni testo riporta quali strutture NON erano ancora disponibili quando è stato scritto. Se una frase suona goffa ma il modo naturale di dirla userebbe una di quelle strutture, è un vincolo, non un errore: basta segnalarlo come tale.'),
  P('Se invece la frase è sbagliata anche restando dentro quei limiti, è un errore vero — ed è esattamente ciò che cerco.'),
  new Paragraph({ text: '', spacing: { after: 120 } }),
  new Paragraph({ text: 'Convenzioni già decise', heading: HeadingLevel.HEADING_2 }),
  P('• L’articolo -ը diventa -ն davanti a parola che inizia per vocale (Ես տանն եմ, հայրն ու մայրը, Ես Դավիթն եմ), ma resta -ը davanti a numerale (Ժամը երկուսն է) e davanti a և.'),
  P('• «վաղը» è trattato come avverbio, senza alternanza.'),
  P('• Le missioni usano un registro parlato e colloquiale; le letture un registro neutro.'),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- letture ----------
children.push(new Paragraph({ text: 'Parte 1 — Letture', heading: HeadingLevel.HEADING_1 }));

const readingMeta = missions.missions.filter(m => m.kind === 'reading');
const ordered = readingMeta.slice().sort((a, b) => posOf(a.after) - posOf(b.after));

for (const meta of ordered) {
  const file = path.join(LES, meta.id + '.json');
  if (!fs.existsSync(file)) continue;
  const doc = JSON.parse(fs.readFileSync(file));
  const s = doc.steps[0];

  children.push(new Paragraph({
    text: `${meta.title} — ${meta.id}`,
    heading: HeadingLevel.HEADING_2,
  }));
  if (s.title) children.push(hy(s.title, { bold: true, size: 28 }));

  const mancanti = vincoliPer(meta.after);
  children.push(nota(
    `Collocazione: dopo la lezione ${meta.after} (${posOf(meta.after)}ª su ${seq.length}). ` +
    (mancanti.length
      ? `Non ancora disponibili a questo punto: ${mancanti.join(', ')}.`
      : 'A questo punto tutte le strutture del corso sono disponibili.') +
    (s.type === 'reading_ext'
      ? ' Questo è un testo di lettura estensiva: qui il vincolo NON si applica, le parole difficili sono glossate a parte.'
      : '')
  ));

  const frasiHy = splitHy(s.text);
  const frasiIt = s.it ? splitIt(s.it) : [];
  if (frasiIt.length === frasiHy.length) {
    for (let i = 0; i < frasiHy.length; i++) {
      children.push(hy(frasiHy[i]));
      children.push(it(frasiIt[i]));
    }
  } else {
    children.push(hy(s.text));
    if (s.it) children.push(it(s.it));
  }

  if (s.newWords && s.newWords.length) {
    children.push(P('Parole nuove introdotte:', { bold: true, size: 20 }));
    for (const w of s.newWords) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: w.hy, font: HY, size: 22 }),
          new TextRun({ text: `  ${w.ipa || ''}  — ${w.it}`, size: 18, color: '555555' }),
        ],
        spacing: { after: 40 },
      }));
    }
  }
  if (s.questions && s.questions.length) {
    children.push(P('Domande di comprensione:', { bold: true, size: 20 }));
    for (const q of s.questions) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '• ' + q.q, size: 18, font: q.q.match(/[\u0561-\u0587]/) ? HY : undefined })],
        spacing: { after: 30 },
      }));
    }
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));
}

// ---------- missioni ----------
children.push(new Paragraph({ text: 'Parte 2 — Missioni (dialoghi)', heading: HeadingLevel.HEADING_1 }));
children.push(P('Ogni missione è un compito comunicativo. Lo studente sceglie fra alternative; una è corretta, le altre sono errori plausibili. Chiedo di verificare soprattutto le battute del personaggio (NPC) e le risposte corrette — le alternative sbagliate sono sbagliate di proposito.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

for (const meta of missions.missions.filter(m => m.kind !== 'reading')) {
  // gli id delle missioni sono «market», i file «mission_market.json»
  let file = path.join(LES, meta.id + '.json');
  if (!fs.existsSync(file)) file = path.join(LES, 'mission_' + meta.id + '.json');
  if (!fs.existsSync(file)) { console.log('manca:', meta.id); continue; }
  const doc = JSON.parse(fs.readFileSync(file));
  const s = doc.steps[0];

  children.push(new Paragraph({ text: `${meta.title} — ${meta.id}`, heading: HeadingLevel.HEADING_2 }));
  children.push(nota(`Area: ${meta.area}. Sbloccata dopo il modulo ${meta.after}. Registro: parlato.`));
  if (s.goal) children.push(P('Obiettivo: ' + s.goal, { size: 20 }));

  if (s.pretask && s.pretask.phrases) {
    children.push(P('Frasi fornite prima del compito:', { bold: true, size: 20 }));
    for (const f of s.pretask.phrases) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: f.hy, font: HY, size: 22 }),
          new TextRun({ text: `  — ${f.it}`, size: 18, color: '555555' }),
        ],
        spacing: { after: 40 },
      }));
    }
  }

  for (const [i, t] of (s.turns || []).entries()) {
    children.push(P(`Turno ${i + 1}`, { bold: true, size: 20 }));
    if (t.npc) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'NPC: ', size: 18, bold: true }),
                   new TextRun({ text: t.npc.hy, font: HY, size: 22 })],
        spacing: { after: 20 },
      }));
      children.push(it('        ' + t.npc.it));
    }
    for (const o of t.options || []) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: o.ok ? '✓ ' : '✗ ', size: 18, bold: true, color: o.ok ? '2A6B52' : 'AAAAAA' }),
          new TextRun({ text: o.hy, font: HY, size: 22, color: o.ok ? '000000' : '777777' }),
          new TextRun({ text: `  — ${o.it}`, size: 16, color: '777777' }),
        ],
        spacing: { after: 20 },
      }));
      if (o.ok && o.reply) {
        children.push(new Paragraph({
          children: [new TextRun({ text: '    NPC: ', size: 16, bold: true }),
                     new TextRun({ text: o.reply.hy, font: HY, size: 20 })],
          spacing: { after: 60 },
        }));
      }
    }
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));
}

const document = new Document({
  creator: 'AB1J',
  title: 'AB1J — Materiali da revisionare',
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
    children,
  }],
});

const out = process.argv[2] || '/mnt/user-data/outputs/AB1J_revisione_madrelingua.docx';
Packer.toBuffer(document).then(buf => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log('scritto:', out);
  console.log('letture:', ordered.length, '| missioni:', missions.missions.filter(m => m.kind !== 'reading').length);
});
