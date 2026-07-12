// Bootstrap dell'applicazione.
import { route, startRouter } from './core/router.js';
import { applySettings } from './core/store.js';
import * as home from './screens/home.js';
import * as lesson from './screens/lesson.js';
import * as review from './screens/review.js';
import * as alphabet from './screens/alphabet.js';
import * as stats from './screens/stats.js';
import * as settings from './screens/settings.js';
import { updateBadge } from './screens/review.js';

const screen = document.getElementById('screen');

applySettings();

route('/home',        () => home.render(screen));
route('/lesson/:id',  p  => lesson.render(screen, p));
route('/review',      () => review.render(screen));
route('/alphabet',    () => alphabet.render(screen));
route('/stats',       () => stats.render(screen));
route('/settings',    () => settings.render(screen));

startRouter();
updateBadge();
window.addEventListener('hashchange', updateBadge);
