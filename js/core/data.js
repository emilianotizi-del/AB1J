// Caricamento dei contenuti (JSON) con cache in memoria.
// Il contenuto è separato dal motore: aggiungere una lingua = aggiungere una cartella.
const cache = new Map();

async function load(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Impossibile caricare ' + url);
  const json = await res.json();
  cache.set(url, json);
  return json;
}

const LANG = 'hy';
export const getCourse   = () => load(`data/${LANG}/course.json`);
export const getAlphabet = () => load(`data/${LANG}/alphabet.json`);
export const getLesson   = id => load(`data/${LANG}/lessons/${id}.json`);

export async function getLetter(glyph) {
  const alpha = await getAlphabet();
  return alpha.letters.find(l => l.upper === glyph || l.lower === glyph);
}
