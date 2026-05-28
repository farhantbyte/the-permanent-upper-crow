import './index.css';
import { deriveLoopValues, loadLoop, saveLoop, type GameState } from './state';
import type { GameContext, Screen } from './screens/types';
import { storeScreen } from './screens/store';
import { factoryScreen } from './screens/factory';
import { newsScreen } from './screens/news';
import { shipScreen } from './screens/ship';
import { arrivalScreen } from './screens/arrival';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

// Five screens, mounted in order. Advancing past the last
// (`arrival`) bumps the loop counter, persists it, and lands
// the player back at the store with ×100 numbers — the
// recursion the spec is built around.
const screens: Screen[] = [
  storeScreen,
  factoryScreen,
  newsScreen,
  shipScreen,
  arrivalScreen,
];

// Dev jump: ?screen=<0..4 | store | factory | couch | ship | arrival>
// and/or ?loop=<n> bypass the linear flow. Harmless in production —
// if the params aren't there, you get the normal opening at screen 0.
const SCREEN_NAMES: Record<string, number> = {
  store: 0,
  factory: 1,
  news: 2,
  couch: 2,
  ship: 3,
  arrival: 4,
};

function parseDevParams(): { startIdx: number; loop: number | null } {
  const params = new URLSearchParams(window.location.search);
  let startIdx = 0;
  const screenParam = params.get('screen');
  if (screenParam !== null) {
    const asNum = Number.parseInt(screenParam, 10);
    if (Number.isFinite(asNum) && asNum >= 0) {
      startIdx = Math.min(asNum, screens.length - 1);
    } else if (screenParam in SCREEN_NAMES) {
      startIdx = Math.min(SCREEN_NAMES[screenParam], screens.length - 1);
    }
  }
  let loop: number | null = null;
  const loopParam = params.get('loop');
  if (loopParam !== null) {
    const n = Number.parseInt(loopParam, 10);
    if (Number.isFinite(n) && n >= 1) loop = n;
  }
  return { startIdx, loop };
}

const dev = parseDevParams();
const loop = dev.loop ?? loadLoop();
const state: GameState = {
  screen: 0,
  loop,
  ...deriveLoopValues(loop),
};

let cleanup: (() => void) | null = null;
let currentIdx = 0;

function mount(idx: number): void {
  // Past the last screen — close the loop. Bump the counter,
  // persist it, refresh the derived balance/price, and land at
  // the store again. The new founder, the ×100 prices, and the
  // hat the player still can't afford are all the satire needs.
  if (idx >= screens.length) {
    state.loop += 1;
    saveLoop(state.loop);
    const next = deriveLoopValues(state.loop);
    state.balance = next.balance;
    state.hatPrice = next.hatPrice;
    idx = 0;

    // Bridge the arrival screen's black veil into the next mount
    // with a body-level overlay that lingers across the swap and
    // fades out once the store has had a frame to paint. Without
    // it, the cut from "full black" to "fully-lit hat shop" snaps
    // — and the recursion is meant to feel like a fade-back-in.
    const veil = document.createElement('div');
    veil.classList.add('loop-veil');
    document.body.appendChild(veil);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => veil.classList.add('fading'));
    });
    veil.addEventListener('transitionend', () => veil.remove(), { once: true });
  }
  const next = screens[idx];
  if (cleanup) cleanup();
  app!.innerHTML = '';
  currentIdx = idx;
  const ctx: GameContext = {
    state,
    advance: () => mount(currentIdx + 1),
  };
  cleanup = next.mount(app!, ctx);
}

mount(dev.startIdx);
