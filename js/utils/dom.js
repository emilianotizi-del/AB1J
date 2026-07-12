// Piccole utilità DOM condivise.
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Blocco parola standard: script + traslitterazione + IPA + italiano.
export function wordBlock(w, { withIt = true } = {}) {
  const b = el('div', { class: 'word-block' });
  b.append(el('div', { class: 'w-hy', lang: 'hy' }, w.hy));
  if (w.tr) b.append(el('div', { class: 'w-tr' }, w.tr));
  if (w.ipa) b.append(el('div', { class: 'w-ipa' }, w.ipa));
  if (withIt && w.it) b.append(el('div', { class: 'w-it' }, w.it));
  return b;
}
