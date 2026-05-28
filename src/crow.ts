export type CrowVariant = 'player' | 'rich' | 'background' | 'robo';

// Reaper-crow silhouette inspired by Death's Door: rounded head,
// triangular beak (right), tail-feather notches at the hem, two
// stubby legs integrated into the path itself (notch tips at
// x=60 and x=40 extend down as flat rectangular pegs).
//
// The eye is rendered as two stacked sibling shapes painted in
// `var(--color-surface)` on top of the body — an open circle and
// a closed horizontal slash. CSS toggles their opacity to drive
// the periodic blink (see `.crow-eye-open` / `.crow-eye-closed`
// in index.css). They sit on the dark surface so the surface-
// coloured fill reads as a hole through the white silhouette.
const CROW_SVG = `<svg viewBox="0 0 100 144" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M50 8C62 8 70 17 70 26L100 34L70 42C78 52 86 82 86 112L86 124L80 130L76 124L70 130L66 124L62 130L62 140L58 140L58 130L56 124L50 130L46 124L42 130L42 140L38 140L38 130L36 124L30 130L26 124L20 130L14 124L14 112C14 82 22 52 30 42C30 17 38 8 50 8Z"/><circle class="crow-eye-open" fill="var(--color-surface)" cx="46" cy="28" r="8"/><path class="crow-eye-closed" fill="var(--color-surface)" d="M38 27L54 27L54 29L38 29Z"/></svg>`;

// Rich crow: same body with a stovepipe top hat (crown +
// wider brim) integrated into the silhouette as one continuous
// path. Brim's outer edges curl slightly upward (Q curves on
// top edge ending 2u above the brim-near-crown level). Below
// the brim, the path flows into the head's natural curves —
// no overlap, no gap.
const CROW_RICH_SVG = `<svg viewBox="0 -16 100 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M26 2Q30 4 42 4L42 -14L58 -14L58 4Q70 4 74 2L74 10L70 12C72 16 72 22 70 26L100 34L70 42C78 52 86 82 86 112L86 124L80 130L76 124L70 130L66 124L62 130L62 140L58 140L58 130L56 124L50 130L46 124L42 130L42 140L38 140L38 130L36 124L30 130L26 124L20 130L14 124L14 112C14 82 22 52 30 42C28 22 28 16 30 12L26 10ZM38 28a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z"/></svg>`;

// Winking variant of the rich crow — identical to the body
// above, but the eye sub-path is a thin horizontal slash rather
// than a circle, so the eye reads as closed. Used as a brief
// inner-HTML swap on the rich crow when he hits a flirty line.
const CROW_RICH_WINKING_SVG = `<svg viewBox="0 -16 100 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M26 2Q30 4 42 4L42 -14L58 -14L58 4Q70 4 74 2L74 10L70 12C72 16 72 22 70 26L100 34L70 42C78 52 86 82 86 112L86 124L80 130L76 124L70 130L66 124L62 130L62 140L58 140L58 130L56 124L50 130L46 124L42 130L42 140L38 140L38 130L36 124L30 130L26 124L20 130L14 124L14 112C14 82 22 52 30 42C28 22 28 16 30 12L26 10ZM38 27L54 27L54 29L38 29Z"/></svg>`;

// Chunky 7×6 pixel heart drawn as six axis-aligned subpaths.
// Red so it reads as a love beat against the otherwise grayscale
// palette (and matches `--color-error` elsewhere in the UI).
const HEART_SVG = `<svg viewBox="0 0 7 6" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#ff3344" d="M1 0L3 0L3 1L1 1ZM4 0L6 0L6 1L4 1ZM0 1L7 1L7 3L0 3ZM1 3L6 3L6 4L1 4ZM2 4L5 4L5 5L2 5ZM3 5L4 5L4 6L3 6Z"/></svg>`;

// Robo crow: the factory output the player ships. The marketing
// label rotates per loop (see cast.ts `product`), but the visual
// is always this same body — same silhouette as the standard crow
// + two small antennas integrated into the path top,
// SQUARE eye (= screen/visor), and two metal "straps" wrapping
// the chest and lower body. Each strap is a slight trapezoid
// (top edge narrower than bottom) so it tracks the body's curve
// and doesn't poke past the silhouette. All cutouts are
// subpaths of the same path via fill-rule "evenodd" — no
// separate elements, no alpha stacking on the translucent
// variant.
const CROW_ROBO_SVG = `<svg viewBox="0 0 100 144" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M44 2L46 2L46 8L54 8L54 2L56 2L56 8C64 8 70 18 70 26L100 34L70 42C78 52 86 82 86 112L86 124L80 130L76 124L70 130L66 124L62 130L62 140L58 140L58 130L56 124L50 130L46 124L42 130L42 140L38 140L38 130L36 124L30 130L26 124L20 130L14 124L14 112C14 82 22 52 30 42C30 18 36 8 44 8ZM38 20L54 20L54 36L38 36ZM22 58L78 58L79 62L21 62ZM15 92L85 92L85 96L15 96Z"/></svg>`;

const CROW_SVG_BY_VARIANT: Record<CrowVariant, string> = {
  player: CROW_SVG,
  rich: CROW_RICH_SVG,
  background: CROW_SVG,
  robo: CROW_ROBO_SVG,
};

export function createCrow(variant: CrowVariant): HTMLElement {
  const el = document.createElement('div');
  el.classList.add('crow', `crow-${variant}`);
  if (variant === 'player') el.classList.add('crow-glow-player');
  if (variant === 'rich') el.classList.add('crow-glow-rich');
  el.innerHTML = CROW_SVG_BY_VARIANT[variant];
  return el;
}

// Swap the rich crow's SVG for the winking variant for ~durationMs,
// then restore. Returns a cleanup that restores immediately —
// callers should invoke it on screen unmount so we never leave
// the crow mid-wink across a screen swap.
export function winkRich(crowEl: HTMLElement, durationMs = 750): () => void {
  crowEl.innerHTML = CROW_RICH_WINKING_SVG;
  const timer = window.setTimeout(() => {
    crowEl.innerHTML = CROW_RICH_SVG;
  }, durationMs);
  return () => {
    window.clearTimeout(timer);
    crowEl.innerHTML = CROW_RICH_SVG;
  };
}

// Spawn a pink/red pixel heart inside `parent` that floats up and
// fades over ~1.8 s. Parent must be `position: relative` (the
// shared `.crow` rule handles that). Self-removes on animationend.
export function popHeart(parent: HTMLElement): void {
  const heart = document.createElement('span');
  heart.classList.add('crow-heart');
  heart.setAttribute('aria-hidden', 'true');
  heart.innerHTML = HEART_SVG;
  parent.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove(), { once: true });
}
