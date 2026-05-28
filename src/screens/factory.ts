import { startConveyor } from '../audio';
import { getRichCast } from '../cast';
import { createCrow } from '../crow';
import { createDialogue } from '../dialogue';
import { deriveLoopValues } from '../state';
import { createHud, createPrimaryButton } from '../ui';
import type { Screen } from './types';

const FACTORY_DIALOGUE: readonly string[] = [
  'KAWKAWKAWKAWKAW! KAWKAW! KAWKAWKAWKAWKAWKAW!!!',
  'We are so back.',
  'I can smell our investors gawking at these Q2 profits.',
  'Our next quarter will crush those damn Eagles.',
  'Great work! I knew you had the grit in you.',
  "I'm looking forward to enjoying my— I mean our fortune very soon in our initial public offering.",
  'See you in the office Sunday morning dear.',
];

// Comically vague disclaimers shown when the player taps the
// caution badge on the machine. The point is "if you read this,
// you'd never sign" — except, of course, you already signed.
const WARNING_DISCLAIMERS: readonly string[] = [
  'May contain trace amounts of crow.',
  'Do not operate while sleeping. Or awake.',
  'Safety lawsuits are subject to a 7-loop arbitration clause buried in section 47B of the employment agreement you already signed.',
];

// Each slot is one robo plus the per-item right-margin. Keep in
// sync with .factory-robo's width + margin-right in index.css.
const SLOT_WIDTH_PX = 58;
const MIN_CONVEYOR_SLOTS = 8;
// Pixels-per-second of conveyor travel. The keyframe duration is
// derived from copy-width so wider screens don't make the belt
// look like it's on fast-forward.
const CONVEYOR_PX_PER_SEC = 55;

// Random delay range (ms) between PLEASE HELP appearances. First
// appearance uses the shorter `FIRST_*` range so the easter egg
// shows up relatively soon after mount.
const HELP_FIRST_DELAY_MIN = 5_000;
const HELP_FIRST_DELAY_MAX = 15_000;
const HELP_DELAY_MIN = 22_000;
const HELP_DELAY_MAX = 55_000;

// Brief delay before the rich crow starts talking so the player
// can read the scene first.
const DIALOGUE_START_DELAY_MS = 700;

export const factoryScreen: Screen = {
  mount(host, ctx) {
    const { balance } = deriveLoopValues(ctx.state.loop);
    const cast = getRichCast(ctx.state.loop);

    const root = document.createElement('div');
    root.classList.add('screen', 'screen-factory');

    // HUD
    const hudWrap = document.createElement('div');
    hudWrap.classList.add('hud-wrap');
    hudWrap.appendChild(createHud({ balance }));

    // Scene: pair-talking (left) · factory box + conveyor (right)
    const scene = document.createElement('div');
    scene.classList.add('factory-scene');

    // Pair on the left, facing each other. Player faces right
    // (default), rich crow faces left (mirrored).
    const pair = document.createElement('div');
    pair.classList.add('factory-pair');
    const playerCrow = createCrow('player');
    const richCrow = createCrow('rich');
    richCrow.classList.add('crow-mirrored');
    pair.append(playerCrow, richCrow);

    // Right: factory box (labeled with current loop's company)
    // followed by a conveyor that stretches off the right edge.
    const line = document.createElement('div');
    line.classList.add('factory-line');

    const box = document.createElement('div');
    box.classList.add('factory-box');
    box.innerHTML = `
      <div class="factory-box-tubes" aria-hidden="true">
        <div class="factory-box-tube"><span class="factory-box-puff"></span></div>
        <div class="factory-box-tube"><span class="factory-box-puff"></span></div>
      </div>
      <button type="button" class="factory-box-caution" aria-label="Warning details">⚠</button>
      <span class="factory-box-company">${cast.company.toUpperCase()}</span>
      <span class="factory-box-product">ROBO CROW MACHINE</span>
    `;
    const cautionBtn = box.querySelector<HTMLButtonElement>(
      '.factory-box-caution',
    )!;

    const conveyor = document.createElement('div');
    conveyor.classList.add('factory-conveyor');
    const strip = document.createElement('div');
    strip.classList.add('factory-strip');
    // One copy of the strip must be at least as wide as the
    // visible conveyor; otherwise translateX by one copy-width
    // leaves empty space at the seam. Size dynamically based on
    // current viewport. Strip then duplicates (×2) and the loop
    // translates by exactly one copy-width.
    const slotsPerCopy = Math.max(
      MIN_CONVEYOR_SLOTS,
      Math.ceil(window.innerWidth / SLOT_WIDTH_PX) + 2,
    );
    const copyWidthPx = slotsPerCopy * SLOT_WIDTH_PX;
    strip.style.setProperty('--copy-width', `${copyWidthPx}px`);
    strip.style.setProperty(
      '--roll-duration',
      `${copyWidthPx / CONVEYOR_PX_PER_SEC}s`,
    );
    for (let copy = 0; copy < 2; copy += 1) {
      for (let i = 0; i < slotsPerCopy; i += 1) {
        const robo = createCrow('robo');
        robo.classList.add('factory-robo');
        strip.appendChild(robo);
      }
    }
    conveyor.appendChild(strip);

    line.append(box, conveyor);
    scene.append(line, pair);

    // Dialogue box — fades in immediately; rich crow starts
    // talking after a short beat. There is no entry button on
    // this screen.
    const dialogue = createDialogue({ speaker: cast.name.toUpperCase() });
    dialogue.el.classList.add('shown');

    // Warning popup — surfaced when the caution badge on the
    // machine is tapped. Comically vague disclaimers; the
    // [ noted ] button just dismisses.
    const warning = document.createElement('div');
    warning.classList.add('warning-overlay', 'reveal');
    warning.setAttribute('role', 'dialog');
    warning.setAttribute('aria-modal', 'true');
    warning.setAttribute('aria-labelledby', 'warning-title');
    warning.innerHTML = `
      <div class="warning-card">
        <div class="warning-header">
          <span class="warning-icon" aria-hidden="true">⚠</span>
          <span class="warning-title" id="warning-title">WARNING</span>
        </div>
        <ul class="warning-list">
          ${WARNING_DISCLAIMERS.map((d) => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `;
    const warningCard = warning.querySelector<HTMLDivElement>(
      '.warning-card',
    )!;
    const warningActions = document.createElement('div');
    warningActions.classList.add('warning-actions');
    const understoodBtn = createPrimaryButton('understood', () =>
      closeWarning(),
    );
    warningActions.appendChild(understoodBtn);
    warningCard.appendChild(warningActions);

    root.append(hudWrap, scene, dialogue.el, warning);
    host.appendChild(root);

    const openWarning = () => {
      warning.classList.add('shown');
      dialogue.setActive(false);
    };
    const closeWarning = () => {
      warning.classList.remove('shown');
      // Drop focus off the button so subsequent Enter/Space
      // hits the dialogue advance instead of the dismissed btn.
      understoodBtn.blur();
      dialogue.setActive(true);
    };
    cautionBtn.addEventListener('click', openWarning);

    dialogue.onAdvance(() => {
      ctx.advance();
    });

    const startDelayTimer = window.setTimeout(() => {
      dialogue.play(FACTORY_DIALOGUE);
    }, DIALOGUE_START_DELAY_MS);

    // Easter egg: rare normal (non-robo) crow rides the conveyor
    // with a PLEASE HELP speech bubble. Spawned at randomized
    // intervals; self-removes when its travel animation ends.
    let helpTimer: number | null = null;

    const spawnPleaseHelp = () => {
      const wrap = document.createElement('div');
      wrap.classList.add('please-help');
      wrap.setAttribute('aria-hidden', 'true');

      const bubble = document.createElement('span');
      bubble.classList.add('please-help-bubble');
      bubble.textContent = 'PLEASE HELP';

      const crow = createCrow('player');
      crow.classList.add('please-help-crow');

      wrap.append(bubble, crow);
      conveyor.appendChild(wrap);

      const travelPx = conveyor.clientWidth + 200;
      wrap.style.setProperty('--travel', `${travelPx}px`);
      wrap.style.animationDuration = `${travelPx / CONVEYOR_PX_PER_SEC}s`;
      wrap.addEventListener('animationend', () => wrap.remove(), {
        once: true,
      });
    };

    const scheduleHelp = (firstShot = false) => {
      const min = firstShot ? HELP_FIRST_DELAY_MIN : HELP_DELAY_MIN;
      const max = firstShot ? HELP_FIRST_DELAY_MAX : HELP_DELAY_MAX;
      const delay = min + Math.random() * (max - min);
      helpTimer = window.setTimeout(() => {
        helpTimer = null;
        spawnPleaseHelp();
        scheduleHelp();
      }, delay);
    };
    scheduleHelp(true);

    // Faint conveyor-belt ambience under the whole screen. Stops
    // (with a short fade) when the player advances away.
    const stopConveyor = startConveyor();

    return () => {
      stopConveyor();
      window.clearTimeout(startDelayTimer);
      if (helpTimer !== null) window.clearTimeout(helpTimer);
      cautionBtn.removeEventListener('click', openWarning);
      dialogue.cleanup();
      root.remove();
    };
  },
};
