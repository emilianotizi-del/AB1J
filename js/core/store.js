// Persistenza locale con namespace. Astratta: in futuro sostituibile con IndexedDB.
const NS = 'ab1j.';

function get(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function set(key, value) {
  localStorage.setItem(NS + key, JSON.stringify(value));
}

/* --- Impostazioni --- */
const DEFAULT_SETTINGS = {
  theme: 'light',        // light | dark
  showTr: true,          // traslitterazione
  showIpa: true,         // IPA
  duration: 30           // 30 | 10 minuti
};
export function getSettings() { return { ...DEFAULT_SETTINGS, ...get('settings', {}) }; }
export function saveSettings(s) { set('settings', s); applySettings(s); }
export function applySettings(s = getSettings()) {
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.dataset.hideTr = s.showTr ? '0' : '1';
  document.documentElement.dataset.hideIpa = s.showIpa ? '0' : '1';
}

/* --- Progresso lezioni --- */
export function getCompleted() { return get('completed', []); }
export function markCompleted(lessonId) {
  const c = getCompleted();
  if (!c.includes(lessonId)) { c.push(lessonId); set('completed', c); }
  touchActivity();
}

/* --- Mazzo SRS --- */
export function getDeck() { return get('deck', {}); }        // { cardId: card }
export function saveDeck(deck) { set('deck', deck); }

/* --- Attività giornaliera (per lo streak) --- */
export function touchActivity() {
  const days = get('activity', []);
  const today = new Date().toISOString().slice(0, 10);
  if (!days.includes(today)) { days.push(today); set('activity', days); }
}
// Contatore di azioni di studio (risposte + ripassi) per giorno.
export function recordEvent() {
  const ev = get('events', {});
  const today = new Date().toISOString().slice(0, 10);
  ev[today] = (ev[today] || 0) + 1;
  set('events', ev);
  touchActivity();
}
export function getEvents() { return get('events', {}); }

export function getStreak() {
  const days = new Set(get('activity', []));
  let streak = 0;
  const d = new Date();
  // Lo streak resta valido se l'ultima attività è oggi o ieri.
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* --- Esporta / importa --- */
export function exportAll() {
  const dump = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(NS)) dump[k] = localStorage.getItem(k);
  }
  return JSON.stringify({ app: 'AB1J', version: 1, data: dump }, null, 2);
}
export function importAll(json) {
  const parsed = JSON.parse(json);
  if (parsed.app !== 'AB1J' || !parsed.data) throw new Error('File non valido');
  Object.entries(parsed.data).forEach(([k, v]) => localStorage.setItem(k, v));
}
export function resetAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(NS))
    .forEach(k => localStorage.removeItem(k));
}
