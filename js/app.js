// Bootstrap dell'applicazione.
import { route, startRouter } from './core/router.js';
import { applySettings } from './core/store.js';
import * as home from './screens/home.js';
import * as lesson from './screens/lesson.js';
import * as review from './screens/review.js';
import * as alphabet from './screens/alphabet.js';
import * as stats from './screens/stats.js';
import * as settings from './screens/settings.js';
import * as pronounce from './screens/pronounce.js';
import * as sounds from './screens/sounds.js';
import * as missions from './screens/missions.js';
import * as missionPlay from './screens/mission_play.js';
import * as hardLetters from './screens/hard_letters.js';
import * as confusable from './screens/confusable.js';
import { migrateDeck } from './core/srs.js';
import { updateBadge } from './screens/review.js';

const screen = document.getElementById('screen');

applySettings();
migrateDeck();

route('/home',        () => home.render(screen));
route('/lesson/:id',  p  => lesson.render(screen, p));
route('/review',      () => review.render(screen));
route('/alphabet',    () => alphabet.render(screen));
route('/stats',       () => stats.render(screen));
route('/settings',    () => settings.render(screen));
route('/pronounce',   () => pronounce.render(screen));
route('/sounds',      () => sounds.render(screen));
route('/hard-letters',() => hardLetters.render(screen));
route('/confusable',  () => confusable.render(screen));
route('/missions',    () => missions.render(screen));
 route('/mission/:id', p  => missionPlay.render(screen, p));

startRouter();
updateBadge();
window.addEventListener('hashchange', updateBadge);
