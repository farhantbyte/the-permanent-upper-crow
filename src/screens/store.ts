import { getRichCast } from '../cast';
import { createCrow } from '../crow';
import { createDialogue } from '../dialogue';
import { deriveLoopValues } from '../state';
import { createHud, createPrimaryButton, formatMoney } from '../ui';
import type { Screen } from './types';

// Standalone top hat. Crown 14 wide × 20 tall, flat brim 24 wide
// × 4 tall. No brim curl — earlier versions had quadratic curl
// at the tips that read as horns at small scale.
const HAT_SVG = `<svg viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 0L22 0L22 20L27 20L27 24L3 24L3 20L8 20Z"/></svg>`;

// Display table: flat top with two front legs reaching the
// viewBox bottom so the table aligns to the same ground line
// as the crow's feet. One continuous silhouette.
const TABLE_SVG = `<svg viewBox="0 0 70 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M5 0L65 0L65 6L60 6L60 32L56 32L56 6L14 6L14 32L10 32L10 6L5 6Z"/></svg>`;

// Benjamin Peck and his successors all deliver the same template
// pitch in proper sentence case — the stilted-formal grammar is
// the marker of corporate persona; every other voice in the game
// stays lowercase.
function makeRichDialogue({
  name,
  company,
}: {
  name: string;
  company: string;
}): readonly string[] {
  return [
    `Why hello there! I'm ${name}, Founder and CEO of ${company}.`,
    "It seems you're having... some trouble with that purchase.",
    'What if I told you you could earn generational wealth with just a few years of hard work?',
    `At ${company}, we produce the Robo-Crow. It is an autonomous robot that automates all labor in the e-kaw-nomy.`,
    'You would be wise to decide soon. We are running out of time before you become stuck with the under-crows.',
    'Equity in our venerable operation is anything but abundant.',
  ];
}

// Spoken by the rich crow after the player signs the contract.
// Same proper-sentence-case voice. Final tap advances to the
// next screen.
const POST_SIGN_DIALOGUE: readonly string[] = [
  "Congratulations! I knew you weren't incompetent!",
  'Cheers to a future of hard working fortune, and fortunate hard work.',
  'See you in the office on Sunday my love.',
];

// First-person internal monologue surfaced when the player taps
// [ decline ]. Each tap cycles to the next reminder of why the
// player can't actually walk away. List loops forever — there is
// no version of saying no that ends.
const DECLINE_THOUGHTS: readonly string[] = [
  'rent is due next month.',
  'the perch payments are three months behind.',
  'groceries. just groceries.',
  'the under-crow loan shark is calling again.',
  'my fledgling cousin needs braces.',
  'my egg insurance lapsed last week.',
  "the nest down payment isn't going to save itself.",
  'mama crow is in the hospital remember.',
  'i told my sister i would help pay for her kaw school fees.',
  'the chickadee i borrowed from is calling. again.',
];

// Subtext that appears under INSUFFICIENT FUNDS once the player
// has tapped the hat enough times to count as bargaining. Indexed
// by (clickCount - HAT_CLICK_SUBTEXT_AT) modulo the list length —
// loops indefinitely so the snark never runs out.
const HAT_CLICK_SUBTEXT_AT = 6;
const HAT_CLICK_SUBTEXT: readonly string[] = [
  "you've already maxed out your crow card.",
  'tapping it harder will not lower the price.',
  'you are cuckoo to keep trying.',
  'have you considered that you simply cannot afford this hat?',
  'the hat does not feel sorry for you.',
  'this is not a wishlist.',
  'you cannot wing this purchase.',
  'you could buy 0.1 of this hat. that is a brim.',
  'even the table is judging you now.',
  "try marrying into the rich crow's family.",
  'stream your tapping on twitch. ask for tips.',
  'the fledgling support program is for actual fledglings.',
  "you've been pecking at this for too long.",
  "ruffled feathers won't budge the price.",
  'no one is impressed by your persistence.',
  'no girlfriend to even split the cost with.',
  'your broke ass gets no finches.',
  'have you considered onlybirds?',
];

const CONFETTI_COUNT = 26;
const CONFETTI_COLORS = ['#ffffff', '#4ade80', '#ffd166'];

function spawnConfetti(host: HTMLElement): void {
  const burst = document.createElement('div');
  burst.classList.add('confetti-burst');
  burst.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    const piece = document.createElement('span');
    piece.classList.add('confetti-piece');
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 360}px`);
    piece.style.setProperty('--dy', `${120 + Math.random() * 220}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    piece.style.background =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = `${Math.floor(Math.random() * 120)}ms`;
    burst.appendChild(piece);
  }
  host.appendChild(burst);
}

export const storeScreen: Screen = {
  mount(host, ctx) {
    const { balance, hatPrice } = deriveLoopValues(ctx.state.loop);
    const cast = getRichCast(ctx.state.loop);
    const richLines = makeRichDialogue(cast);

    const root = document.createElement('div');
    root.classList.add('screen', 'screen-store');

    // HUD
    const hudWrap = document.createElement('div');
    hudWrap.classList.add('hud-wrap');
    hudWrap.appendChild(createHud({ balance }));

    // Stage: display + crows + flash
    const stage = document.createElement('div');
    stage.classList.add('store-stage');

    const playerCol = document.createElement('div');
    playerCol.classList.add('store-col', 'store-col-player');
    playerCol.appendChild(createCrow('player'));

    const displayCol = document.createElement('div');
    displayCol.classList.add('store-col', 'store-col-display');

    const display = document.createElement('button');
    display.type = 'button';
    display.classList.add('store-display');
    display.setAttribute(
      'aria-label',
      `top hat for sale, ${formatMoney(hatPrice)}`,
    );
    display.innerHTML = `
      <span class="store-hat">${HAT_SVG}</span>
      <span class="store-table">${TABLE_SVG}</span>
    `;

    const sign = document.createElement('div');
    sign.classList.add('store-sign');
    sign.innerHTML = `
      <span class="store-sign-main">TOP HAT FOR SALE: ${formatMoney(hatPrice)}</span>
      <span class="store-sign-hint">↓ <span class="hint-action"></span> to buy</span>
    `;

    displayCol.append(sign, display);

    const richCol = document.createElement('div');
    richCol.classList.add('store-col', 'store-col-rich');
    const richCrow = createCrow('rich');
    richCrow.classList.add('crow-mirrored');
    richCol.appendChild(richCrow);

    const flash = document.createElement('div');
    flash.classList.add('insufficient-flash');
    flash.setAttribute('aria-live', 'polite');
    flash.innerHTML = `
      <div class="insufficient-main">INSUFFICIENT FUNDS.</div>
      <div class="insufficient-sub"></div>
    `;
    const flashMain = flash.querySelector<HTMLDivElement>('.insufficient-main')!;
    const flashSub = flash.querySelector<HTMLDivElement>('.insufficient-sub')!;

    stage.append(playerCol, displayCol, richCol, flash);

    // Dialogue box (shared primitive)
    const dialogue = createDialogue({ speaker: cast.name.toUpperCase() });

    // CTA wrap only holds [ continue ] — decline/sign live in
    // the contract popup.
    const cta = document.createElement('div');
    cta.classList.add('cta-wrap');

    const continueBtn = createPrimaryButton('continue', () => onTapContinue());
    continueBtn.classList.add('reveal');

    cta.append(continueBtn);

    // Contract popup — modal overlay revealed after the rich
    // crow's pitch. Decline / sign live inside the card; the
    // decline-thought subtext sits below the buttons.
    const contract = document.createElement('div');
    contract.classList.add('contract-overlay', 'reveal');
    contract.setAttribute('role', 'dialog');
    contract.setAttribute('aria-modal', 'true');
    contract.setAttribute('aria-labelledby', 'contract-title');
    contract.innerHTML = `
      <div class="contract-card">
        <div class="contract-header">
          <div class="contract-eyebrow">EMPLOYMENT AGREEMENT</div>
          <div class="contract-title" id="contract-title">${cast.company}</div>
        </div>
        <div class="contract-body">
          <p>The undersigned ("Employee") agrees to the following terms with ${cast.company} (the "Company"):</p>
          <ol class="contract-terms">
            <li>Dedicate all labor, judgment, and waking hours to the development of Robo-Crow.</li>
            <li>Maintain a 12/12/7 in-office presence at our San Franchickso headquarters.</li>
            <li>Receive complimentary lunch and dinner on premises (mandatory).</li>
            <li>Acknowledge that the window is closing.</li>
            <li>Accept 1% equity in the Company, which the Company affirms is anything but abundant.</li>
            <li>Forfeit the right to wonder if there was another way.</li>
          </ol>
          <div class="contract-signatures">
            <div class="contract-sig">
              <div class="contract-sig-line"></div>
              <div class="contract-sig-label">Employee</div>
            </div>
            <div class="contract-sig">
              <div class="contract-sig-line"></div>
              <div class="contract-sig-label">${cast.name}, Founder &amp; CEO</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const contractCard = contract.querySelector<HTMLDivElement>('.contract-card')!;

    const contractActions = document.createElement('div');
    contractActions.classList.add('contract-actions');
    const decline = createPrimaryButton('decline', () => onTapDecline());
    const accept = createPrimaryButton('sign', () => onTapSign());
    contractActions.append(decline, accept);

    const contractThought = document.createElement('div');
    contractThought.classList.add('contract-thought');
    contractThought.setAttribute('aria-live', 'polite');

    // §47B fine print — physically unreadable. Lives at the very
    // bottom of the card (below the buttons) so it reads as a
    // legal footer.
    const finePrint = document.createElement('p');
    finePrint.classList.add('contract-fine-print');
    finePrint.textContent =
      '§47B. Arbitration. By signing, the Employee waives all rights to legal recourse and agrees to a 7-loop binding arbitration cycle with no recorded arbitrator. The arbitrator is a crow. The arbitrator is unavailable. This section is unenforceable in any jurisdiction where it has been read.';

    contractCard.append(contractActions, contractThought, finePrint);

    root.append(hudWrap, stage, dialogue.el, cta, contract);
    host.appendChild(root);

    // Cascade
    //   beat 0 → 1: tap hat → flash + dim hat + show [ continue ]
    //   beat 1 → 2: tap continue → rich crow slides in, dialogue
    //               box fades in and starts streaming the pitch
    //   beat 2 → 3: tap past last pitch line → contract popup
    //   beat 3 → 2: tap sign → contract dismissed, flash turns
    //               green ("CONGRATULATIONS..."), confetti bursts,
    //               post-sign lines start streaming
    //   beat 2 → 4: tap past last post-sign line → ctx.advance()
    let beat: 0 | 1 | 2 | 3 = 0;
    let hatClicks = 0;
    let declineClicks = 0;
    let signed = false;
    let startDelayTimer: number | null = null;

    const onTapDecline = () => {
      declineClicks += 1;
      const idx = (declineClicks - 1) % DECLINE_THOUGHTS.length;
      contractThought.textContent = DECLINE_THOUGHTS[idx];
      contractThought.classList.add('shown');
    };

    const onTapHat = () => {
      hatClicks += 1;

      // Replay the entrance pulse on every tap; flash stays
      // visible once shown.
      flash.classList.remove('show');
      void flash.offsetWidth;
      flash.classList.add('show');

      if (hatClicks >= HAT_CLICK_SUBTEXT_AT) {
        const idx =
          (hatClicks - HAT_CLICK_SUBTEXT_AT) % HAT_CLICK_SUBTEXT.length;
        flashSub.textContent = HAT_CLICK_SUBTEXT[idx];
        flashSub.classList.add('shown');
      }

      if (beat === 0) {
        beat = 1;
        sign.classList.add('hint-consumed');
        displayCol.classList.add('revealed');
        continueBtn.classList.add('shown');
      }
    };

    dialogue.onAdvance(() => {
      if (beat !== 2) return;
      if (!signed) {
        // Past the last pitch line — reveal the contract popup.
        beat = 3;
        dialogue.setActive(false);
        contract.classList.add('shown');
      } else {
        // Past the last post-sign line — advance to next screen.
        ctx.advance();
      }
    });

    const onTapSign = () => {
      if (beat !== 3) return;
      signed = true;
      contract.classList.remove('shown');

      // Turn the persistent INSUFFICIENT FUNDS red flash into a
      // green "CONGRATULATIONS ON (FUTURE YOU) BEING RICH" banner.
      // The "(FUTURE YOU)" parenthetical is muted to underscore the
      // satire — you're not rich now, that's for some other you.
      flashMain.innerHTML =
        'CONGRATULATIONS ON <span class="insufficient-aside">(FUTURE YOU)</span> BEING RICH';
      flashSub.classList.remove('shown');
      flash.classList.add('success');
      spawnConfetti(flash);

      // Swap the dialogue script and restart streaming after a
      // brief beat so the contract has time to fade out.
      dialogue.setActive(true);
      beat = 2;
      startDelayTimer = window.setTimeout(() => {
        startDelayTimer = null;
        dialogue.play(POST_SIGN_DIALOGUE);
      }, 450);
    };

    const onTapContinue = () => {
      if (beat !== 1) return;
      beat = 2;
      stage.classList.add('rich-entered');
      continueBtn.classList.remove('shown');
      dialogue.el.classList.add('shown');
      // Let the rich crow get partway into his entrance before
      // he starts talking — feels less like he's already standing
      // there mid-sentence.
      startDelayTimer = window.setTimeout(() => {
        startDelayTimer = null;
        dialogue.play(richLines);
      }, 600);
    };

    display.addEventListener('click', onTapHat);

    return () => {
      if (startDelayTimer !== null) window.clearTimeout(startDelayTimer);
      display.removeEventListener('click', onTapHat);
      dialogue.cleanup();
      root.remove();
    };
  },
};
