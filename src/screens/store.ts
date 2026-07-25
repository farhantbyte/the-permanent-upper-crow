import { playCelebrate, playDenied } from '../audio';
import { getRichCast } from '../cast';
import { createCrow, popHeart, winkRich } from '../crow';
import { createDialogue } from '../dialogue';
import { deriveLoopValues } from '../state';
import { createHud, createPrimaryButton, formatMoney } from '../ui';
import { t } from '../translations';
import type { Screen } from './types';

// Standalone top hat. Crown 14 wide × 20 tall, flat brim 24 wide
// × 4 tall. No brim curl — earlier versions had quadratic curl
// at the tips that read as horns at small scale.
const HAT_SVG = `<svg viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 0L22 0L22 20L27 20L27 24L3 24L3 20L8 20Z"/></svg>`;

// Display table: flat top with two front legs reaching the
// viewBox bottom so the table aligns to the same ground line
// as the crow's feet. One continuous silhouette.
const TABLE_SVG = `<svg viewBox="0 0 70 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M5 0L65 0L65 6L60 6L60 32L56 32L56 6L14 6L14 32L10 32L10 6L5 6Z"/></svg>`;

// Subtext that appears under INSUFFICIENT FUNDS once the player
// has tapped the hat enough times to count as bargaining. Indexed
// by (clickCount - HAT_CLICK_SUBTEXT_AT) modulo the list length —
// loops indefinitely so the snark never runs out.
const HAT_CLICK_SUBTEXT_AT = 3;
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
    const richLines = t().store.richLines(cast.name, cast.company, cast.product);

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
      <span class="store-sign-main">${t().store.ui.hatForSale}: ${formatMoney(hatPrice)}</span>
      <span class="store-sign-hint">↓ <span class="hint-action"></span> ${t().store.ui.toBuy}</span>
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
      <div class="insufficient-main">${t().store.ui.insufficientFunds}</div>
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

    const continueBtn = createPrimaryButton(t().store.ui.btnContinue, () => onTapContinue());
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
          <div class="contract-eyebrow">${t().store.ui.contractEyebrow}</div>
          <div class="contract-title" id="contract-title">${cast.company}</div>
        </div>
        <div class="contract-body">
          <p>${t().store.ui.contractIntro(cast.company)}</p>
          <ol class="contract-terms">
            ${t().store.ui.contractTerms(cast.product).map((term) => `<li>${term}</li>`).join('')}
          </ol>
          <div class="contract-signatures">
            <div class="contract-sig">
              <div class="contract-sig-line"></div>
              <div class="contract-sig-label">${t().store.ui.employeeLabel}</div>
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
    const decline = createPrimaryButton(t().store.ui.btnDecline, () => onTapDecline());
    const accept = createPrimaryButton(t().store.ui.btnSign, () => onTapSign());
    contractActions.append(decline, accept);

    const contractThought = document.createElement('div');
    contractThought.classList.add('contract-thought');
    contractThought.setAttribute('aria-live', 'polite');

    // §47B fine print — physically unreadable. Lives at the very
    // bottom of the card (below the buttons) so it reads as a
    // legal footer.
    const finePrint = document.createElement('p');
    finePrint.classList.add('contract-fine-print');
    finePrint.textContent = t().store.ui.finePrint;

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
      playDenied();
      const idx = (declineClicks - 1) % t().store.declineThoughts.length;
      contractThought.textContent = t().store.declineThoughts[idx];
      contractThought.classList.add('shown');
    };

    const onTapHat = () => {
      hatClicks += 1;
      playDenied();

      // Replay the entrance pulse on every tap; flash stays
      // visible once shown.
      flash.classList.remove('show');
      void flash.offsetWidth;
      flash.classList.add('show');

      if (hatClicks >= HAT_CLICK_SUBTEXT_AT) {
        const idx =
          (hatClicks - HAT_CLICK_SUBTEXT_AT) % t().store.hatSubtext.length;
        flashSub.textContent = t().store.hatSubtext[idx];
        flashSub.classList.add('shown');
      }

      if (beat === 0) {
        beat = 1;
        sign.classList.add('hint-consumed');
        displayCol.classList.add('revealed');
        continueBtn.classList.add('shown');
        // Move focus from the hat to the new primary action so
        // Enter/Space activates [ continue ] without a Tab.
        continueBtn.focus({ preventScroll: true });
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

    // Rich crow winks + a red pixel heart pops on his flirty
    // "see you in the office Sunday" close-out. Substring match
    // so the line wording can vary between loops without
    // breaking the cue.
    let cancelWink: (() => void) | null = null;
    dialogue.onLineComplete((_idx, line) => {
      if (line.toLowerCase().includes('see you in the office')) {
        cancelWink?.();
        cancelWink = winkRich(richCrow);
        popHeart(richCrow);
      }
    });

    const onTapSign = () => {
      if (beat !== 3) return;
      signed = true;
      playCelebrate();
      // The sign button is about to be hidden; drop focus off it
      // so the next Enter/Space lands on the dialogue keydown
      // handler instead of replaying the now-dead button.
      accept.blur();
      contract.classList.remove('shown');

      // Turn the persistent INSUFFICIENT FUNDS red flash into a
      // green "CONGRATULATIONS ON (FUTURE YOU) BEING RICH" banner.
      // The "(FUTURE YOU)" parenthetical is muted to underscore the
      // satire — you're not rich now, that's for some other you.
      flashMain.innerHTML = t().store.ui.congratulations;
      flashSub.classList.remove('shown');
      flash.classList.add('success');
      spawnConfetti(flash);

      // Swap the dialogue script and restart streaming after a
      // brief beat so the contract has time to fade out.
      dialogue.setActive(true);
      beat = 2;
      startDelayTimer = window.setTimeout(() => {
        startDelayTimer = null;
        dialogue.play(t().store.postSignLines);
      }, 450);
    };

    const onTapContinue = () => {
      if (beat !== 1) return;
      beat = 2;
      stage.classList.add('rich-entered');
      continueBtn.classList.remove('shown');
      // Same reason as onTapSign — drop focus so subsequent
      // Enter/Space hits the dialogue advance, not the dead btn.
      continueBtn.blur();
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
    // Auto-focus the hat so the player can press Enter/Space to
    // start the sequence without ever touching the mouse.
    display.focus({ preventScroll: true });

    return () => {
      if (startDelayTimer !== null) window.clearTimeout(startDelayTimer);
      cancelWink?.();
      display.removeEventListener('click', onTapHat);
      dialogue.cleanup();
      root.remove();
    };
  },
};
