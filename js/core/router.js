// Router hash-based (compatibile con GitHub Pages: nessuna riscrittura server).
const routes = [];

export function route(pattern, handler) {
  const names = [];
  const rx = new RegExp('^' + pattern.replace(/:[^/]+/g, seg => {
    names.push(seg.slice(1));
    return '([^/]+)';
  }) + '$');
  routes.push({ rx, names, handler });
}

export function navigate(path) {
  location.hash = path.startsWith('#') ? path : '#' + path;
}

function resolve() {
  const path = location.hash.slice(1) || '/home';
  for (const r of routes) {
    const m = path.match(r.rx);
    if (m) {
      const params = {};
      r.names.forEach((n, i) => { params[n] = decodeURIComponent(m[i + 1]); });
      updateTabs(path);
      r.handler(params);
      return;
    }
  }
  navigate('/home');
}

function updateTabs(path) {
  document.querySelectorAll('.tab').forEach(t => {
    const tab = t.dataset.tab;
    t.classList.toggle('active', path === '/' + tab || path.startsWith('/' + tab + '/'));
  });
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
