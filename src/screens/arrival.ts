import { createCrow } from '../crow';
import { createDialogue } from '../dialogue';
import { deriveLoopValues } from '../state';
import { createHud } from '../ui';
import type { Screen } from './types';

// The arrival beat. We have just escaped the home planet on the
// SpaceKAW. The player crow stands alone on the new planet,
// freshly rich, and adopts the rich crow's proper-sentence-case
// voice for the first time in the game — the marker that he has
// joined the upper class.
//
// The HUD shows the post-launch balance (`deriveLoopValues(loop +
// 1).balance`) — the windfall, not the loop he just played.
//
// After the dialogue, the crow walks off the right side of the
// scene, the whole view fades to black, and the next mount lands
// us back at the hat shop with the loop incremented and the
// numbers ×100. The recursion is meant to feel hallucinatory:
// you "earned" peace on a new planet, and the first thing you
// do is walk back into the same shop.

const PLAYER_SPEAKER = 'YOU';

const ARRIVAL_LINES: readonly string[] = [
  'Finally... I can enjoy my money.',
  '...',
  'I should probably buy some new clothes...',
];

const STAR_COUNT = 38;

const DIALOGUE_START_DELAY_MS = 900;
const WALK_DURATION_MS = 2200;
const VEIL_FADE_MS = 1400;
// Hold on full black for a beat before mounting the next screen.
// The pause is the punchline — you've gone somewhere new, then
// the lights come up on the same hat shop.
const VEIL_HOLD_MS = 400;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export const arrivalScreen: Screen = {
  mount(host, ctx) {
    const nextBalance = deriveLoopValues(ctx.state.loop + 1).balance;

    const root = document.createElement('div');
    root.classList.add('screen', 'screen-arrival');

    const hudWrap = document.createElement('div');
    hudWrap.classList.add('hud-wrap');
    hudWrap.appendChild(createHud({ balance: nextBalance }));

    // Stage: starfield in the upper half (we just landed —
    // unfamiliar sky), ground line across the middle, player crow
    // standing on it.
    const stage = document.createElement('div');
    stage.classList.add('arrival-stage');

    const stars = document.createElement('div');
    stars.classList.add('arrival-stars');
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const star = document.createElement('span');
      star.classList.add('arrival-star');
      star.style.left = `${rand(0, 100).toFixed(2)}%`;
      // Keep stars in the upper 70% so they don't sit behind the
      // crow's feet.
      star.style.top = `${rand(0, 70).toFixed(2)}%`;
      const size = 1 + Math.floor(Math.random() * 2);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty('--delay', `${rand(0, 4).toFixed(2)}s`);
      star.style.setProperty('--dur', `${rand(3.4, 6).toFixed(2)}s`);
      stars.appendChild(star);
    }

    const ground = document.createElement('div');
    ground.classList.add('arrival-ground');

    const crowWrap = document.createElement('div');
    crowWrap.classList.add('arrival-crow');
    crowWrap.appendChild(createCrow('player'));

    stage.append(stars, ground, crowWrap);

    const dialogue = createDialogue({ speaker: PLAYER_SPEAKER });
    dialogue.el.classList.add('shown');

    // Full-screen veil that fades in once the crow starts walking.
    // Reaches solid black before the next screen mounts so the
    // recursion punchline lands as a cut-from-dark.
    const veil = document.createElement('div');
    veil.classList.add('arrival-veil');

    root.append(hudWrap, stage, dialogue.el, veil);
    host.appendChild(root);

    let startTimer: number | null = null;
    let walkTimer: number | null = null;

    dialogue.onAdvance(() => {
      dialogue.setActive(false);
      // Crow walks off the right side of the stage; HUD, stars,
      // dialogue all fade out simultaneously; veil rises to full
      // black. After it settles, we ctx.advance() — main.ts
      // re-mounts the store with the loop incremented.
      root.classList.add('walking');
      walkTimer = window.setTimeout(() => {
        walkTimer = null;
        ctx.advance();
      }, WALK_DURATION_MS + VEIL_HOLD_MS);
    });

    startTimer = window.setTimeout(() => {
      startTimer = null;
      dialogue.play(ARRIVAL_LINES);
    }, DIALOGUE_START_DELAY_MS);

    // CSS variables consumed by the keyframes / transitions in
    // index.css. Centralised here so the timings stay in sync
    // with the JS-side timeouts.
    root.style.setProperty('--walk-duration', `${WALK_DURATION_MS}ms`);
    root.style.setProperty('--veil-fade', `${VEIL_FADE_MS}ms`);

    return () => {
      if (startTimer !== null) window.clearTimeout(startTimer);
      if (walkTimer !== null) window.clearTimeout(walkTimer);
      dialogue.cleanup();
      root.remove();
    };
  },
};
