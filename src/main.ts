import './index.css';
import { deriveLoopValues, loadLoop, type GameState } from './state';
import type { GameContext, Screen } from './screens/types';
import { storeScreen } from './screens/store';
import { factoryScreen } from './screens/factory';
import { placeholderScreen } from './screens/placeholder';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

// Screens are mounted in order. Placeholder stands in for Screen
// 3 until PR 5 (the couch) replaces it.
const screens: Screen[] = [storeScreen, factoryScreen, placeholderScreen];

// Dev jump: ?screen=<0..3 | store | factory | couch | ship> and/or
// ?loop=<n> bypass the linear flow. Harmless in production — if
// the params aren't there, you get the normal opening at screen 0.
const SCREEN_NAMES: Record<string, number> = {
  store: 0,
  factory: 1,
  couch: 2,
  ship: 3,
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
  const next = screens[Math.min(idx, screens.length - 1)];
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
