import './index.css';
import { playDenied, unlockAudio } from './audio';
import { setLanguage, getLanguage, availableLanguages, applyDirection, t, type Language } from './translations';
import { deriveLoopValues, loadLoop, saveLoop, type GameState } from './state';
import type { GameContext, Screen } from './screens/types';
import { storeScreen } from './screens/store';
import { factoryScreen } from './screens/factory';
import { newsScreen } from './screens/news';
import { shipScreen } from './screens/ship';
import { arrivalScreen } from './screens/arrival';
import {
  createCawfeeButton,
  createGithubLink,
  createHackerNewsLink,
  createMuteButton,
  createResetButton,
  createWebsiteLink,
} from './ui';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

// Body-level full-viewport black overlay used to bridge two
// otherwise-jarring transitions: the spaceship → store loop-back
// (the "trip" recursion) and the manual reset button. Lives in
// body so screen swaps don't tear it down mid-fade. Removes
// itself after its opacity transition ends.
function spawnLoopVeil(): void {
  const veil = document.createElement('div');
  veil.classList.add('loop-veil');
  document.body.appendChild(veil);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => veil.classList.add('fading'));
  });
  veil.addEventListener('transitionend', () => veil.remove(), { once: true });
}

// Body-level chapter card that bridges the ship → arrival hop.
// Spawns at full black with a single line of text, holds, then
// fades out revealing the freshly-mounted arrival screen. Ship
// fades to black on its own first, so the handoff has no flash.
// Hold + fade is also passed to arrival as ctx.entryDelayMs so
// its dialogue doesn't start streaming under the veil.
const INTERSTITIAL_HOLD_MS = 1300;
const INTERSTITIAL_FADE_MS = 1400;

function spawnInterstitial(text: string): void {
  const veil = document.createElement('div');
  veil.classList.add('interstitial-veil');
  veil.style.setProperty('--interstitial-fade', `${INTERSTITIAL_FADE_MS}ms`);
  const textEl = document.createElement('div');
  textEl.classList.add('interstitial-veil-text');
  textEl.textContent = text;
  veil.appendChild(textEl);
  document.body.appendChild(veil);
  window.setTimeout(() => {
    veil.classList.add('fading');
    veil.addEventListener('transitionend', () => veil.remove(), { once: true });
  }, INTERSTITIAL_HOLD_MS);
}

// Audio contexts are blocked until the first user gesture.
// Resume on whatever the player does first — click, tap, key.
const unlock = () => {
  unlockAudio();
  window.removeEventListener('pointerdown', unlock);
  window.removeEventListener('keydown', unlock);
};
window.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);

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
  const fromIdx = currentIdx;
  let entryDelayMs = 0;
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
    // so the cut from "full black" to "fully-lit hat shop" fades
    // in rather than snapping — same effect the manual reset
    // button reuses.
    spawnLoopVeil();
  } else if (fromIdx === 3 && idx === 4) {
    // Ship → arrival. Ship has already faded to black; this
    // chapter card holds over the screen swap so the new planet
    // doesn't snap into view. Tell arrival to defer its dialogue
    // until the veil is fully gone — otherwise voice blips fire
    // under the black and the player can hear text they can't
    // yet read.
    spawnInterstitial(t().exti.interstitial);
    entryDelayMs = INTERSTITIAL_HOLD_MS + INTERSTITIAL_FADE_MS;
  }
  const next = screens[idx];
  if (cleanup) cleanup();
  app!.innerHTML = '';
  currentIdx = idx;
  // Reset chip is only meaningful when the player is back at the
  // hat shop on a later loop. Hide it on every other screen, and
  // on loop 1 where there is nothing to reset.
  resetBtn.style.display = idx === 0 && state.loop > 1 ? '' : 'none';
  const ctx: GameContext = {
    state,
    advance: () => mount(currentIdx + 1),
    entryDelayMs,
  };
  cleanup = next.mount(app!, ctx);
  applyDirection();
}

// Persistent corner controls. Stacked together in a single
// fixed wrapper at the viewport's top-right so they share one
// safe-area-inset baseline. Reset sits to the left of mute,
// hidden by default; mount() shows it only when the player is
// on the store screen at loop ≥ 2.
const cornerStack = document.createElement('div');
cornerStack.classList.add('corner-stack');
const resetBtn = createResetButton(() => {
  state.loop = 1;
  saveLoop(1);
  const refreshed = deriveLoopValues(1);
  state.balance = refreshed.balance;
  state.hatPrice = refreshed.hatPrice;
  spawnLoopVeil();
  mount(0);
});
resetBtn.style.display = 'none';
cornerStack.appendChild(resetBtn);

// Fake "buy me a cawfee" tip jar. The joke: tapping it does
// nothing useful — just pops a red "you are too broke to be
// helping others right now" toast with the denied thud. Persists
// across every screen so the bit lands on each loop, not just at
// the hat shop.
let cawfeeToast: HTMLElement | null = null;
let cawfeeToastTimer: number | null = null;
const CAWFEE_TOAST_MS = 2400;

function showCawfeeToast(): void {
  if (!cawfeeToast) {
    cawfeeToast = document.createElement('div');
    cawfeeToast.classList.add('cawfee-toast');
    document.body.appendChild(cawfeeToast);
  }
  cawfeeToast.textContent = t().exti.cawfeeToast;
  if (cawfeeToastTimer !== null) window.clearTimeout(cawfeeToastTimer);
  // Restart the fade-in transition on repeat taps.
  cawfeeToast.classList.remove('shown');
  void cawfeeToast.offsetWidth;
  cawfeeToast.classList.add('shown');
  cawfeeToastTimer = window.setTimeout(() => {
    cawfeeToast?.classList.remove('shown');
    cawfeeToastTimer = null;
  }, CAWFEE_TOAST_MS);
}

const cawfeeBtn = createCawfeeButton(() => {
  showCawfeeToast();
  playDenied();
});
cornerStack.appendChild(cawfeeBtn);
cornerStack.appendChild(
  createHackerNewsLink('https://news.ycombinator.com/item?id=48310280'),
);
cornerStack.appendChild(
  createWebsiteLink(
    'https://www.jasonwu.ink/signals/2026-05-27-permanent-upper-class?theme=dark',
  ),
);
cornerStack.appendChild(
  createGithubLink('https://github.com/wu-json/the-permanent-upper-crow'),
);
// nothing special to comment... KAWW, KAWWW
const langSelect = document.createElement('select');
langSelect.classList.add('btn-corner');
langSelect.classList.add('corner-btn'); // KAWW, KAWW
langSelect.setAttribute('aria-label', 'Select language');
availableLanguages.forEach((lang) => {
  const option = document.createElement('option');
  option.value = lang;
  option.textContent = lang.toUpperCase();
  option.selected = lang === getLanguage();
  langSelect.appendChild(option);
});
langSelect.addEventListener('change', () => {
  setLanguage(langSelect.value as Language);
  mount(currentIdx);
  applyDirection();
});
cornerStack.appendChild(langSelect);

cornerStack.appendChild(createMuteButton());
document.body.appendChild(cornerStack);

mount(dev.startIdx);
