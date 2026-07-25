import { playCelebrate, playCounterSweep, startCrowd } from '../audio';
import { getRichCast } from '../cast';
import { createCrow } from '../crow';
import { createDialogue } from '../dialogue';
import { deriveLoopValues } from '../state';
import { formatMoney } from '../ui';
import { t } from '../translations';
import type { Screen } from './types';

const REPORTER_NAME = 'Trisha Cawkanawa';
const NETWORK_NAME = 'Caw News Network';

// Trisha's report — Caw News Network bills itself as an
// independent newsroom, which the rest of her broadcast quietly
// undermines: every story attributes the good news AND the bad
// news to the current loop's company. company + product rotate
// per loop alongside the rest of the rich-crow cast.
function makeNewsDialogue(company: string, product: string): readonly string[] {
  return [
    `Good evening. I'm ${REPORTER_NAME}, reporting live for ${NETWORK_NAME} — your independent voice.`,
    "Tonight's top story: under-crow riots have engulfed twelve districts. Casualties are climbing.",
    `${company} reports record Q3 earnings, beating every analyst expectation as the looting continues unabated.`,
    `Analysts credit ${company}'s ${product} rollout for an unprecedented productivity surge — and an unprecedented surge in under-crow violence.`,
    `Food prices are up 312% year over year. ${company} has issued a statement assuring viewers that this is, quote, "fine".`,
    'The under-crows have stormed the lobby. I can hear them breaking down the studio door. We will not be covering this.',
    'Back to you.',
  ];
}

// Studio microphone sitting on the news desk — capsule head +
// three horizontal mesh lines on the head + thin neck + small
// base. ViewBox is exact to the content so the base actually
// touches the desk top instead of floating.
const MIC_SVG = `<svg viewBox="0 0 14 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M7 0C10.31 0 13 3.13 13 7L13 13C13 16.87 10.31 20 7 20C3.69 20 1 16.87 1 13L1 7C1 3.13 3.69 0 7 0ZM6 20L8 20L8 38L11 38L11 42L3 42L3 38L6 38Z"/><path fill="none" stroke="rgba(0,0,0,0.65)" stroke-width="0.9" stroke-linecap="round" d="M2.5 6L11.5 6M1.5 10L12.5 10M2.5 14L11.5 14"/></svg>`;

function makeChyronStrings(product: string): readonly string[] {
  return [
    '12 DISTRICTS ABLAZE',
    'UNDER-CROWS RIOTING',
    `${product.toUpperCase()} Q3 EARNINGS BEAT`,
    'FOOD PRICES UP 312% Y/Y',
    'CITY HALL OVERRUN',
    'STATE OF EMERGENCY DECLARED',
    'STUDIO LOBBY BREACHED',
  ];
}
const CHYRON_INTERVAL_MS = 1800;
const DIALOGUE_START_DELAY_MS = 700;

// Reveal sequence timings.
const SCENE_FADE_MS = 500;
const COUNTER_DURATION_MS = 1500;
// Sit on the final value for a beat after the celebratory pulse
// before fading out — gives the player time to read the number.
const POST_COUNTER_HOLD_MS = 2200;
const FINAL_FADE_MS = 500;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const newsScreen: Screen = {
  mount(host, ctx) {
    // Pre-news balance is the loop's start; the reveal counts up
    // to the post-launch balance (next loop's start) so the
    // player sees their windfall land.
    const prevBalance = deriveLoopValues(ctx.state.loop).balance;
    const nextBalance = deriveLoopValues(ctx.state.loop + 1).balance;

    const cast = getRichCast(ctx.state.loop);
    const newsLines = t().news.lines(cast.company, cast.product);
    const chyronStrings = t().news.chyron(cast.product);

    const root = document.createElement('div');
    root.classList.add('screen', 'screen-news');

    // (No HUD on this screen — the NEST WORTH reveal IS the HUD,
    // unlocked at the end of Trisha's broadcast.)

    // TV chassis with screen, LIVE indicator, reporter + desk +
    // mic, and chyron strip.
    const tv = document.createElement('div');
    tv.classList.add('news-tv');

    const tvScreen = document.createElement('div');
    tvScreen.classList.add('news-tv-screen');

    const live = document.createElement('div');
    live.classList.add('news-live');
    live.innerHTML = `<span class="news-live-dot" aria-hidden="true"></span><span class="news-live-label">${t().news.live}</span>`;

    const scene = document.createElement('div');
    scene.classList.add('news-scene');

    const reporter = createCrow('player');
    reporter.classList.add('news-reporter');
    const mic = document.createElement('div');
    mic.classList.add('news-mic');
    mic.innerHTML = MIC_SVG;
    const desk = document.createElement('div');
    desk.classList.add('news-desk');
    desk.innerHTML = `<span class="news-desk-label">${t().news.networkLabel}</span>`;
    scene.append(reporter, mic, desk);

    const chyron = document.createElement('div');
    chyron.classList.add('news-chyron');
    const chyronLabel = document.createElement('span');
    chyronLabel.classList.add('news-chyron-tag');
    chyronLabel.textContent = t().news.breaking;
    const chyronText = document.createElement('span');
    chyronText.classList.add('news-chyron-text');
    chyronText.textContent = chyronStrings[0];
    chyron.append(chyronLabel, chyronText);

    tvScreen.append(live, scene, chyron);
    tv.appendChild(tvScreen);

    // Dialogue box (Trisha's report).
    const dialogue = createDialogue({ speaker: t().news.reporterName.toUpperCase() });
    dialogue.el.classList.add('shown');

    // Balance reveal — full-screen, initially hidden. Shown after
    // Trisha's last line: TV + dialogue fade out, this fades in
    // and counts the balance up from prev → next.
    const reveal = document.createElement('div');
    reveal.classList.add('news-reveal');
    reveal.setAttribute('aria-hidden', 'true');
    const revealLabel = document.createElement('div');
    revealLabel.classList.add('news-reveal-label');
    revealLabel.textContent = t().news.nestWorth;
    const revealValue = document.createElement('div');
    revealValue.classList.add('news-reveal-value');
    revealValue.textContent = formatMoney(prevBalance);
    reveal.append(revealLabel, revealValue);

    root.append(tv, dialogue.el, reveal);
    host.appendChild(root);

    // Chyron cycler.
    let chyronIdx = 0;
    const chyronTimer = window.setInterval(() => {
      chyronIdx = (chyronIdx + 1) % chyronStrings.length;
      chyronText.textContent = chyronStrings[chyronIdx];
    }, CHYRON_INTERVAL_MS);

    // Timer / animation handles for cleanup.
    let startDelayTimer: number | null = null;
    let fadeTimer: number | null = null;
    let holdTimer: number | null = null;
    let finalFadeTimer: number | null = null;
    let counterRaf: number | null = null;
    let stopSweep: (() => void) | null = null;

    const runCounter = (onDone: () => void) => {
      // Rising square-wave sweep underneath the counter so the
      // ear tracks the value climbing.
      stopSweep = playCounterSweep(COUNTER_DURATION_MS);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / COUNTER_DURATION_MS, 1);
        const eased = easeOutCubic(t);
        const current = Math.round(
          prevBalance + (nextBalance - prevBalance) * eased,
        );
        revealValue.textContent = formatMoney(current);
        if (t < 1) {
          counterRaf = window.requestAnimationFrame(tick);
        } else {
          counterRaf = null;
          stopSweep = null;
          revealValue.textContent = formatMoney(nextBalance);
          onDone();
        }
      };
      counterRaf = window.requestAnimationFrame(tick);
    };

    dialogue.onAdvance(() => {
      // Beat 1: fade out TV + dialogue.
      tv.classList.add('news-fading');
      dialogue.el.classList.add('news-fading');

      fadeTimer = window.setTimeout(() => {
        fadeTimer = null;
        // Beat 2: reveal the centered NEST WORTH and count it up.
        reveal.classList.add('shown');
        runCounter(() => {
          // Beat 3: brief celebratory pulse / glow + arpeggio.
          reveal.classList.add('landed');
          playCelebrate();
          holdTimer = window.setTimeout(() => {
            holdTimer = null;
            // Beat 4: fade everything out, then advance.
            reveal.classList.add('news-fading');
            finalFadeTimer = window.setTimeout(() => {
              finalFadeTimer = null;
              ctx.advance();
            }, FINAL_FADE_MS);
          }, POST_COUNTER_HOLD_MS);
        });
      }, SCENE_FADE_MS);
    });

    startDelayTimer = window.setTimeout(() => {
      startDelayTimer = null;
      dialogue.play(newsLines);
    }, DIALOGUE_START_DELAY_MS);

    // Angry under-crow crowd ambience under the whole broadcast.
    // Fades out cleanly when the screen unmounts.
    const stopCrowd = startCrowd();

    return () => {
      stopCrowd();
      stopSweep?.();
      window.clearInterval(chyronTimer);
      if (startDelayTimer !== null) window.clearTimeout(startDelayTimer);
      if (fadeTimer !== null) window.clearTimeout(fadeTimer);
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      if (finalFadeTimer !== null) window.clearTimeout(finalFadeTimer);
      if (counterRaf !== null) window.cancelAnimationFrame(counterRaf);
      dialogue.cleanup();
      root.remove();
    };
  },
};
