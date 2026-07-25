import { isMuted, onMuteChange, toggleMute } from './audio';
import { t } from './translations'

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
  labelEl.textContent = t().news.nestWorth;

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
// Counter-clockwise circular arrow — the universal "reset /
// restart" mark. Inline SVG so it inherits `currentColor` from
// the button and stays in the same monochrome palette as the
// speaker icon on the opposite corner.
const ICON_RESET = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-7.7L3 8"/><path d="M3 3v5h5"/></svg>`;

export function createResetButton(onReset: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-corner', 'btn-reset');
  btn.innerHTML = ICON_RESET;
  btn.setAttribute('aria-label', 'reset to the beginning');
  btn.addEventListener('click', onReset);
  return btn;
}

// GitHub mark — the standard Octicons silhouette, drawn into a
// 24×24 viewBox so it matches the reset / mute icons and the
// chip renders at the same size.
const ICON_GITHUB = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>`;

export function createGithubLink(href: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.classList.add('btn-corner', 'btn-github');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'open the source on GitHub in a new tab');
  link.innerHTML = ICON_GITHUB;
  return link;
}

// 5-petal spider lily — the personal-website flower mark
// (jasonwu.ink). Same geometry as the site's favicon: five
// ellipse petals at 72° increments around a centered disc,
// drawn into a 100×100 viewBox. fill="currentColor" lets the
// chip's text color drive the petals so it matches the other
// corner icons.
const ICON_FLOWER = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor"><ellipse cx="50" cy="22" rx="10" ry="22" transform="rotate(0 50 50)"/><ellipse cx="50" cy="22" rx="10" ry="22" transform="rotate(72 50 50)"/><ellipse cx="50" cy="22" rx="10" ry="22" transform="rotate(144 50 50)"/><ellipse cx="50" cy="22" rx="10" ry="22" transform="rotate(216 50 50)"/><ellipse cx="50" cy="22" rx="10" ry="22" transform="rotate(288 50 50)"/><circle cx="50" cy="50" r="8"/></svg>`;

export function createWebsiteLink(href: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.classList.add('btn-corner', 'btn-website');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute(
    'aria-label',
    "read the author's blog post about this game in a new tab",
  );
  link.innerHTML = ICON_FLOWER;
  return link;
}

// HN-style upvote triangle — the same caret-up shape used as the
// upvote affordance on news.ycombinator.com. Drawn into a 24×24
// viewBox so it lines up with the other corner-chip icons.
const ICON_UPVOTE = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor"><path d="M12 5L3 18h18z"/></svg>`;

export function createHackerNewsLink(href: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.classList.add('btn-corner', 'btn-hn');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute(
    'aria-label',
    'upvote this game on Hacker News in a new tab',
  );
  link.innerHTML = `${ICON_UPVOTE}<span class="btn-hn-label">upvote on HN</span>`;
  return link;
}

// Lucide-style coffee cup — for the "buy me a cawfee" tip chip.
// 24×24 viewBox to match the other corner icons; stroke uses
// currentColor so it inherits the chip's text color.
const ICON_CAWFEE = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;

export function createCawfeeButton(onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('btn-corner', 'btn-cawfee');
  btn.setAttribute('aria-label', t().exti.cawfeeBtn);
  btn.innerHTML = `${ICON_CAWFEE}<span class="btn-cawfee-label">${t().exti.cawfeeBtn}</span>`;
  btn.addEventListener('click', onClick);
  return btn;
}

// Lucide-style speaker silhouette + two arcs ("Volume2") and
// the muted variant with an X to the right ("VolumeX"). Both
// drawn into a 24×24 viewBox so they share the same aspect
// ratio as the reset icon and the buttons can be one size.
const ICON_SOUND_ON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M11 5L6 9H2v6h4l5 4z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;

const ICON_MUTED = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M11 5L6 9H2v6h4l5 4z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 9L16 15M16 9L22 15"/></svg>`;

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
