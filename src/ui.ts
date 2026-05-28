import { isMuted, onMuteChange, toggleMute } from './audio';

export interface HudOptions {
  balance: number;
}

export function formatMoney(n: number): string {
  return `$ ${n.toLocaleString('en-US')}`;
}

// The loop count is intentionally not shown — the player should
// realize the game is looping from the climbing prices alone.
export function createHud({ balance }: HudOptions): HTMLElement {
  const hud = document.createElement('div');
  hud.classList.add('hud');

  const labelEl = document.createElement('span');
  labelEl.classList.add('hud-label');
  labelEl.textContent = 'NEST WORTH:';

  const balanceEl = document.createElement('span');
  balanceEl.classList.add('hud-balance');
  balanceEl.textContent = formatMoney(balance);

  hud.append(labelEl, balanceEl);
  return hud;
}

export function createPrimaryButton(
  label: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-primary');
  btn.textContent = `[ ${label} ]`;
  btn.addEventListener('click', onClick);
  return btn;
}

export function createSkipButton(onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-skip');
  btn.textContent = '[ skip ]';
  btn.addEventListener('click', onClick);
  return btn;
}

// Persistent reset chip. Pinned to the top-left of the viewport
// (safe-area-aware) and mounted to document.body by main.ts so
// screen swaps don't tear it down. Tapping it warps the player
// back to loop 1, screen 0 — the only escape from the recursion
// the game otherwise refuses to offer.
export function createResetButton(onReset: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-corner', 'btn-reset');
  btn.textContent = '[ reset ]';
  btn.setAttribute('aria-label', 'reset to the beginning');
  btn.addEventListener('click', onReset);
  return btn;
}

// Classic speaker silhouette + two short arcs for "sound on";
// same speaker + an X for "muted". Inline SVG so the icon
// inherits `currentColor` from the button and stays at the same
// monochrome weight as the rest of the UI.
const ICON_SOUND_ON = `<svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M0 5L4 5L9 0L9 16L4 11L0 11Z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M12 4Q16 8 12 12"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M16 2Q22 8 16 14"/></svg>`;

const ICON_MUTED = `<svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M0 5L4 5L9 0L9 16L4 11L0 11Z"/><path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M13 5L19 11M19 5L13 11"/></svg>`;

// Pinned to the top-right of the viewport (safe-area-aware) and
// shared across all screens — mounted to document.body by main.ts
// so screen swaps don't tear it down. On desktop it's a small
// bordered chip; on mobile it sits just below the notch.
export function createMuteButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-corner', 'btn-mute');

  const render = () => {
    const m = isMuted();
    btn.innerHTML = m ? ICON_MUTED : ICON_SOUND_ON;
    btn.setAttribute('aria-pressed', m ? 'true' : 'false');
    btn.setAttribute('aria-label', m ? 'unmute' : 'mute');
    btn.classList.toggle('is-muted', m);
  };

  render();
  onMuteChange(render);
  btn.addEventListener('click', toggleMute);
  return btn;
}
