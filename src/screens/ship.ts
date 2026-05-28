import { startSpaceship } from '../audio';
import { createDialogue } from '../dialogue';
import type { Screen } from './types';

// FPV: we are a passenger crow staring out the porthole of the
// SpaceKAW as the upper-crow class evacuates to a new planet. The
// captain narrates over the PA in proper sentence case (same
// businesscrow cadence the rest of the cast uses). The under-crows
// "could not afford the ticket" is the screen's punchline — the
// abandonment beat lands here, in a captain's polite voice.
const CAPTAIN_SPEAKER = 'THE CAPTAIN';

const CAPTAIN_LINES: readonly string[] = [
  'Good evening passengers. This is your Captain, speaking from the deck of the SpaceKAW.',
  'We have officially cleared the home planet. You may now look out your window.',
  'On board this vessel is the entire permanent upper-crow class.',
  'The uncivilized violent under-crows could not follow us.',
  'Our destination is a fresh, untouched planet. There, we will finally live in peace.',
  'We will be arriving shortly...',
  'We earned this.',
  '...',
];

// Visual budget — kept low because all of these are absolutely
// positioned divs animating opacity/transform.
const STAR_COUNT = 56;
const STREAK_COUNT = 14;

// Brief delay before the captain starts so the player registers
// the scene (vibration + stars) first.
const DIALOGUE_START_DELAY_MS = 900;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export const shipScreen: Screen = {
  mount(host, ctx) {
    const root = document.createElement('div');
    root.classList.add('screen', 'screen-ship');

    // Cabin chassis — the bulkhead the porthole is cut into.
    // The vibration animation lives on this element so the entire
    // view shakes together (window + HUD overlay + stars).
    const cabin = document.createElement('div');
    cabin.classList.add('ship-cabin');

    const portWrap = document.createElement('div');
    portWrap.classList.add('ship-port');

    const portInner = document.createElement('div');
    portInner.classList.add('ship-port-inner');

    // Twinkling starfield. Variable size + animation delay so the
    // field doesn't pulse in unison.
    const stars = document.createElement('div');
    stars.classList.add('ship-stars');
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const star = document.createElement('span');
      star.classList.add('ship-star');
      star.style.left = `${rand(0, 100).toFixed(2)}%`;
      star.style.top = `${rand(0, 100).toFixed(2)}%`;
      const size = 1 + Math.floor(Math.random() * 3);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty('--delay', `${rand(0, 4).toFixed(2)}s`);
      star.style.setProperty('--dur', `${rand(2.4, 5).toFixed(2)}s`);
      stars.appendChild(star);
    }

    // Forward-motion streaks — short white trails radiating from
    // the porthole's center to convey "we are moving very fast in
    // the direction we are looking". Angles are evenly spaced
    // around the circle with small per-streak jitter so they don't
    // look stamped.
    const streaks = document.createElement('div');
    streaks.classList.add('ship-streaks');
    for (let i = 0; i < STREAK_COUNT; i += 1) {
      const streak = document.createElement('span');
      streak.classList.add('ship-streak');
      const angle = (i / STREAK_COUNT) * 360 + rand(-12, 12);
      streak.style.setProperty('--angle', `${angle.toFixed(2)}deg`);
      streak.style.setProperty('--delay', `${rand(0, 2).toFixed(2)}s`);
      streak.style.setProperty('--dur', `${rand(1.4, 2.6).toFixed(2)}s`);
      streaks.appendChild(streak);
    }

    // HUD overlay inside the port — small CRT-y label at the top
    // and four corner reticles. Reinforces "this is a viewport,
    // we are inside something looking out".
    const hud = document.createElement('div');
    hud.classList.add('ship-hud');
    hud.innerHTML = `
      <span class="ship-hud-label">SPACEKAW · FLT 001 → NEW CAW-NAAN</span>
      <span class="ship-hud-corner ship-hud-tl" aria-hidden="true"></span>
      <span class="ship-hud-corner ship-hud-tr" aria-hidden="true"></span>
      <span class="ship-hud-corner ship-hud-bl" aria-hidden="true"></span>
      <span class="ship-hud-corner ship-hud-br" aria-hidden="true"></span>
    `;

    portInner.append(stars, streaks, hud);
    portWrap.appendChild(portInner);
    cabin.appendChild(portWrap);

    const dialogue = createDialogue({ speaker: CAPTAIN_SPEAKER });
    dialogue.el.classList.add('shown');

    root.append(cabin, dialogue.el);
    host.appendChild(root);

    dialogue.onAdvance(() => {
      ctx.advance();
    });

    const startTimer = window.setTimeout(() => {
      dialogue.play(CAPTAIN_LINES);
    }, DIALOGUE_START_DELAY_MS);

    // Spaceship interior ambience under the captain's address.
    const stopShip = startSpaceship();

    return () => {
      stopShip();
      window.clearTimeout(startTimer);
      dialogue.cleanup();
      root.remove();
    };
  },
};
