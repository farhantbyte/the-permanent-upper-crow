---
status: draft
---

# Permanent Upper-Crow — Initial Scaffold & Game Spec

## Premise

A short, recursive interactive story-game satirizing the "permanent upper-class" doom mentality among SF techies: AI will close all economic mobility, so extract generational wealth *now* — at any cost. You play a crow, complicit in building the system that hollows out your world. Each loop you get richer, prices climb, the world degrades, and you keep playing. The recursion is the joke.

---

## Goals

- **Tiny.** First load well under 100 KB gzipped. No images, no video, no bundled web fonts.
- **Cheap to host.** Static deploy on Vercel free tier. Zero server, zero edge functions, zero runtime API calls.
- **Mobile-first.** Touch input, single-column portrait, runs on a mid-range phone over 3G. Viewport-fit for safe areas.
- **Visually coherent with `~/GitHub/personal/personal-website` dark mode.** Pure-black surface, white ink with opacity ramps, subtle glow via `drop-shadow` / `text-shadow`, pixel-font headings. Restrained motion.
- **3–5 minutes per first loop, faster after.** Point lands by loop 2 or 3.
- **Loops forever; *feels* escalating.** No length cap — the ×10 prices and balance climbing each loop are what make the player stop.

## Non-goals

- No accounts, no server state, no analytics, no telemetry.
- No audio in v1.
- No game mechanics — story-game with single-button advance.
- No multiplayer, no leaderboards, no server-side share images.
- No 3D / WebGL / `three.js`. (Personal-website's spider lily uses WebGL; we deliberately don't.)

---

## Story (canonical script)

Dialogue is short, deadpan, lowercase except for proper nouns / brand names. The golden crow speaks with techno-optimist cadence ("we're so back", "generational", "the only ethical move").

### Screen 1 — *The Grocery Store*

Setting: 2D storefront silhouette. Player-crow at a counter. Bread price tag: `$ 47`. HUD balance: `$ 12`.

- Tap to buy bread → `INSUFFICIENT FUNDS.` flash.
- **Golden crow** enters from the right with a faint warm glow.
- *"the window is closing. AI is coming for all of it. you have one shot to lock in generational wealth before the under-crows lose their last leverage. work with me. we automate crow-work. we call it Robo-Crow."*
- One button: `[ accept ]`. There is no decline — the absent option *is* the satire.

### Screen 2 — *The Factory*

Setting: rows of small dark crow silhouettes on a conveyor. Player-crow at a console. Golden crow at the frame's edge.

- Tap `[ ship it ]` → conveyor animates (CSS transform only).
- Golden crow: *"clean launch. we're so back. let's take it public."*
- Auto-advance after a short beat. `[ skip ]` is available bottom-right on every story screen.

### Screen 3 — *The Couch*

Setting: player-crow on a couch in front of a TV. Chyron cycles, pixel font, all-caps:

- `JOB MARKET COLLAPSES`
- `UNDER-CROWS PROTEST`
- `ROBO-CROW Q3 EARNINGS BEAT`
- `FOOD PRICES UP 312% Y/Y`

HUD has jumped (e.g. `$ 41,200`).

- Tap to advance. No dialogue.
- Faint footnote in `--color-ink-faint`: *"the chyron loops."*

### Screen 4 — *The Spaceship*

Setting: black-on-black starfield (low-opacity white dots twinkling via opacity keyframes). Spaceship silhouette foreground. Tiny crow silhouettes filing in.

- Golden crow: *"the under-crows can't follow us. new planet. we earned this."*
- Tap to advance.

### Screen 5 — *The Grocery Store (Again)*

Same layout as Screen 1, with bank balance and bread price both ~10× higher (relative gap unchanged or worse). Tapping advance re-enters Screen 1 of the next loop. Golden crow returns, identical pitch, with `"the window is closing — again."` on loop ≥ 2.

---

## Loop Escalation

The numbers do the work. No per-loop visual decay — the rising prices alongside the rising balance are the punchline.

| Element | Change per loop |
|---|---|
| Bank balance (start of loop) | × ~10 |
| Bread price | × ~10 |
| Loop counter in corner | `loop 1 / ∞`, `loop 2 / ∞`, … |

No stop condition. Closing the tab is the only exit — that's the joke.

Persisted state (`localStorage` only): `loopCount`. No PII, no IDs.

---

## Visual Language

Dark palette lifted from `personal-website/src/index.css`:

```
--color-surface:        #000000
--color-ink:            #ffffff
--color-ink-soft:       rgba(255,255,255,0.7)
--color-ink-muted:      rgba(255,255,255,0.5)
--color-ink-faint:      rgba(255,255,255,0.3)
--color-ink-ghost:      rgba(255,255,255,0.2)
--color-ink-trace:      rgba(255,255,255,0.1)
--color-ink-hair:       rgba(255,255,255,0.05)
--color-glow-strong:    rgba(255,255,255,0.6)
--color-glow:           rgba(255,255,255,0.3)
--color-glow-soft:      rgba(255,255,255,0.2)
--color-glow-mist:      rgba(255,255,255,0.08)
```

No light-mode toggle — the satire reads darker in dark.

### Crow design

- **Player crow:** simple cute 2D silhouette, solid white. Halo `drop-shadow(0 0 8px var(--color-glow-soft))` + outer breath `drop-shadow(0 0 25px var(--color-glow-mist))`. 7s ease-in-out infinite filter cycle ported from personal-website's `lily-breathe`, renamed `crow-breathe`.
- **Golden crow:** same silhouette geometry, white fill, warm glow `drop-shadow(0 0 8px rgba(255,200,120,0.35))`. The only non-monochrome element in the game — the seductive sheen of the pitch.
- **Background / under-crows:** flat fills at `--color-ink-faint`. No glow, no animation.

All crow art ships as **inline SVG** in the bundle. One shared path per pose (idle, tap-bounce, ship-it) — 4–6 paths total. No raster, no sprite sheet.

### Typography

- Body / dialogue: system sans (`ui-sans-serif, system-ui, sans-serif`). **No Geist woff2** — saves ~80 KB; system sans is fine.
- Headings, HUD numbers, screen titles, TV chyron: **`DotGothic16` via Google Fonts**, fallback `ui-monospace, SFMono-Regular, Menlo`. Loaded with `font-display: swap` and `<link rel="preconnect">` to `fonts.gstatic.com`. ~30 KB, cached across the web.

### Motion

- **CSS keyframes / transforms only.** No `requestAnimationFrame`, no canvas, no animation library.
- Twinkle stars: staggered opacity keyframes.
- Crow halo: `crow-breathe` filter loop.
- Screen transitions: 250 ms cross-fade on a single `<main>`.
- Honor `prefers-reduced-motion: reduce` — drop breathe + twinkle, keep cross-fade.

---

## Architecture

### Stack

- **Vite** — fast dev, tiny prod, zero runtime.
- **Vanilla TypeScript** — no React, no framework, no router. (React + react-dom is ~45 KB gzipped before a single component; we don't need it.)
- **Tailwind v4**, configured like `personal-website` (CSS-driven theme via `@theme` + custom properties). If first prod bundle shows it adds ≥ ~5 KB we don't need, fall back to a hand-written `index.css`.
- Screen state: a single integer + loop counter held in module scope.

### File layout (target)

```
the-permanent-upper-crow/
├── docs/wu-json/                # this skill's output lives here
├── public/                      # static assets (favicon, etc.)
├── src/
│   ├── main.ts                  # entry; mounts to #app, drives screen state
│   ├── state.ts                 # screen index, loop count, balance/price math, localStorage
│   ├── screens/
│   │   ├── store.ts             # screen 1 & 5 (parameterized by loop)
│   │   ├── factory.ts           # screen 2
│   │   ├── couch.ts             # screen 3
│   │   └── ship.ts              # screen 4
│   ├── crow.ts                  # inline SVG crow poses
│   ├── ui.ts                    # HUD, buttons, skip control
│   └── index.css                # palette tokens + minimal Tailwind layer
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── vercel.json                  # caching headers; static-only
```

Every screen module exports:

```ts
export interface Screen {
  mount(host: HTMLElement, ctx: GameContext): () => void; // returns cleanup
}
```

`main.ts` swaps screens by calling cleanup, then mounting the next.

### State

```ts
interface GameState {
  screen: 0 | 1 | 2 | 3 | 4;     // 0=store, 1=factory, 2=couch, 3=ship, 4=store-again
  loop: number;                  // 1, 2, 3, …
  balance: number;               // pure function of loop
  breadPrice: number;            // pure function of loop
}
```

Only `loop` needs persisting; balance and price derive from it.

### Bundle budget

| Concern | Target |
|---|---|
| HTML | < 2 KB |
| JS (gzipped) | < 20 KB |
| CSS (gzipped) | < 10 KB |
| Inline SVG (in JS) | < 5 KB total |
| First-load requests | ≤ 5 (HTML, JS, CSS, Google Fonts CSS, DotGothic16 woff2) |
| Post-interaction requests | 0 |

If a build exceeds this, first cut is Tailwind, then decorative SVG complexity.

---

## Hosting & cost

- Static deploy on Vercel (`vercel.json`: `framework: null`, serves `dist/`). No Serverless / Edge. Build: `vite build` → `dist/`.
- Cache headers: hashed assets `Cache-Control: public, max-age=31536000, immutable`; short max-age on `index.html` so updates ship.
- Vercel Hobby free tier ≈ 100 GB/month bandwidth. At < 100 KB first load and zero post-load requests, ≈ 1M+ first-time visits/month before the cap; much higher with cache reuse.

### Domain

Not in scope. v1 = `*.vercel.app`. Custom domain decided later.

---

## What this branch does

Spec-only. Lands this doc at `docs/wu-json/specs/2026-05-27-initial-scaffold-and-game-spec.md` and writes no code. Implementation happens in the ordered PRs below, one at a time, each merged to `main` before the next opens.

---

## Implementation Plan

Each PR is its own `feat/...` branch, sized for a single-sitting review. PRs go in order — later PRs assume earlier ones merged. Every PR must stay inside the *Bundle budget*; if not, cut decoration before merging.

Every PR after scaffold gets sanity-checked at 375×812 (iPhone-class) in addition to desktop.

### Top-line PR tracker

- [ ] **PR 0** — Spec
- [ ] **PR 1** — Scaffold
- [ ] **PR 2** — Shared primitives
- [ ] **PR 3** — Screen 1: the grocery store
- [ ] **PR 4** — Screen 2: the factory
- [ ] **PR 5** — Screen 3: the couch
- [ ] **PR 6** — Screen 4: the spaceship
- [ ] **PR 7** — Loop wiring + Screen 5
- [ ] **PR 8** — Polish
- [ ] Spec archived

---

### PR 0 — Spec (this branch: `feat/initial-scaffold-and-spec`)

- **Goal:** land this spec doc, no code.
- **Files:**
  - [ ] `docs/wu-json/specs/2026-05-27-initial-scaffold-and-game-spec.md`
- **Acceptance:**
  - [ ] Spec reviewed
  - [ ] `status:` flipped from `draft` → `ready` before PR 1 starts

### PR 1 — Scaffold (`feat/scaffold-vite-vanilla-ts`)

- **Goal:** Vite + vanilla TS + Tailwind v4 deployed to Vercel as a black screen.
- **Adds:**
  - [ ] `package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`
  - [ ] `index.html` with `<html data-theme="dark">`, viewport-fit meta, `<div id="app">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, DotGothic16 Google Fonts `<link>` with `font-display: swap`
  - [ ] `src/main.ts` — mounts to `#app`, renders centered `permanent upper-crow` title in DotGothic16 (system mono during swap) using palette tokens
  - [ ] `src/index.css` — full palette block, Tailwind v4 setup, `--font-pixel` token, `@layer base` body styles (black surface, white ink) ported from `personal-website`
  - [ ] `public/favicon.svg` (minimal white crow silhouette)
  - [ ] `.gitignore`, `README.md` (one paragraph, links to this spec)
- **Acceptance:**
  - [ ] `bun install && bun run dev` boots the black page with the title
  - [ ] `bun run build` produces `dist/` ≤ 15 KB gzipped (font excluded; it's third-party)
  - [ ] Title renders in DotGothic16 after swap; system mono visible during swap (no FOIT)
  - [ ] Deployed to Vercel, renders on iOS Safari + Chrome desktop
  - [ ] No React, no router, no runtime deps beyond TS
- **Dependencies:** none.

### PR 2 — Shared primitives (`feat/crow-svg-and-primitives`)

- **Goal:** visual + structural building blocks every screen reuses. No gameplay yet.
- **Adds:**
  - [ ] `src/crow.ts` — inline SVG for player crow (idle), golden crow (idle), background crow. `variant: "player" | "golden" | "background"` selects glow class.
  - [ ] `src/ui.ts` — pure functions returning DOM nodes for HUD (balance + loop counter), primary `[ button ]`, `[ skip ]` corner control. No screen-specific logic.
  - [ ] `src/state.ts` — `GameState` type, `deriveLoopValues(loop)` pure fn, `loadLoop()` / `saveLoop()` stubs (single `localStorage` key).
  - [ ] `src/screens/types.ts` — `Screen` interface (`mount(host, ctx) → cleanup`).
  - [ ] CSS: `crow-breathe` keyframes (port of `lily-breathe`), `.crow-glow-player`, `.crow-glow-golden`, button base styles, `prefers-reduced-motion` overrides.
  - [ ] Throwaway dev-only "kitchen sink" route in `main.ts` — renders all three crow variants + HUD + button. Deleted in PR 3.
- **Acceptance:**
  - [ ] Kitchen-sink page shows three crows side-by-side, player + golden glowing, background flat
  - [ ] Reduced-motion: halo holds steady, doesn't pulse
  - [ ] Bundle still under budget
- **Dependencies:** PR 1.

### PR 3 — Screen 1: the grocery store (`feat/screen-1-store`)

- **Goal:** first playable beat. Bread is too expensive, golden crow appears, single `[ accept ]` advances to a "screen 2 coming soon" placeholder.
- **Adds:**
  - [ ] `src/screens/store.ts` — storefront silhouette (single SVG path), price tag `$ 47`, HUD `$ 12`, player crow, golden crow entrance (CSS translate from off-right)
  - [ ] `INSUFFICIENT FUNDS.` flash on first tap
  - [ ] Dialogue panel at bottom; single `[ accept ]` button beneath (no decline — the absence is the satire)
  - [ ] Wire `main.ts` to mount Screen 1 by default, removing kitchen sink
  - [ ] Placeholder "screen 2 coming soon" as the next screen so advance works end-to-end in this PR
- **Acceptance:**
  - [ ] On mobile, price tag, HUD, both crows, dialogue, and the single button fit one viewport — no scroll
  - [ ] Golden crow enters with a smooth transform; reduced-motion just fades it in
  - [ ] `[ accept ]` advances to the placeholder
- **Dependencies:** PR 2.

### PR 4 — Screen 2: the factory (`feat/screen-2-factory`)

- **Goal:** launch beat. Conveyor of small crows, `[ ship it ]`, golden crow line, auto-advance.
- **Adds:**
  - [ ] `src/screens/factory.ts` — console silhouette, conveyor row of 5–7 background crows that translate-X on `[ ship it ]`, golden crow at the edge
  - [ ] Auto-advance ~1.2 s after the ship animation ends
  - [ ] Replace the screen-2 placeholder from PR 3
- **Acceptance:**
  - [ ] Conveyor runs via CSS transform, no per-frame JS
  - [ ] `[ skip ]` jumps straight to the next placeholder
  - [ ] Auto-advance respects reduced-motion (no jarring jump — still 1.2 s gate)
- **Dependencies:** PR 3.

### PR 5 — Screen 3: the couch (`feat/screen-3-couch`)

- **Goal:** rich-but-world-on-fire beat. Couch + TV + cycling chyron.
- **Adds:**
  - [ ] `src/screens/couch.ts` — couch silhouette, TV silhouette with text region
  - [ ] Chyron cycler — array of 4 strings in pixel font, swapped every ~1.8 s via `setInterval`, cleared on cleanup. No animation library.
  - [ ] HUD shows post-launch balance (`$ 41,200`) from `deriveLoopValues(1)` for loop 1
  - [ ] Faint footnote: *"the chyron loops."*
- **Acceptance:**
  - [ ] Cleanup clears the interval (unmount + remount doesn't leak)
  - [ ] DotGothic16 renders in the chyron; system-mono swap fallback also legible at iPhone size
- **Dependencies:** PR 4.

### PR 6 — Screen 4: the spaceship (`feat/screen-4-ship`)

- **Goal:** abandonment beat. Starfield + ship + crows boarding.
- **Adds:**
  - [ ] `src/screens/ship.ts` — starfield (50–80 absolutely-positioned dots, staggered opacity keyframes; one CSS-driven layer, no JS)
  - [ ] Ship silhouette foreground
  - [ ] Row of background crows translating toward the ship over ~2 s
  - [ ] Golden crow dialogue
- **Acceptance:**
  - [ ] Starfield doesn't tank FPS on mid-range Android Chrome (scrolling/tapping stays responsive)
  - [ ] Reduced-motion: stars steady, ship still, crows pre-positioned at the ship
- **Dependencies:** PR 5.

### PR 7 — Loop wiring + Screen 5 (`feat/loop-recursion-and-escalation`)

- **Goal:** make the recursion real. Screen 4 advances back into the store with bumped numbers and visible escalation. This is where the satire lands.
- **Adds:**
  - [ ] State: increment `loop` on screen-4 → screen-0 transition, persist via `saveLoop()`
  - [ ] `deriveLoopValues(loop)` returns ×10 balance/price, monotonically
  - [ ] HUD loop counter (`loop 2 / ∞`)
  - [ ] Golden crow opening swaps to `"— again."` on loop ≥ 2
- **Acceptance:**
  - [ ] Hard refresh mid-loop-3 returns to screen 1 of loop 3 (not loop 1)
  - [ ] Clearing `localStorage` resets to loop 1
  - [ ] Numbers stay readable through loop 5 (no HUD pill overflow)
- **Dependencies:** PR 6.

### PR 8 — Polish (`feat/polish-fonts-motion-share`)

- **Goal:** final pass for anything deferred during slices.
- **Adds:**
  - [ ] Web Share API button (no-op on unsupported browsers — zero bytes added there)
  - [ ] Reduced-motion audit across all five screens
  - [ ] `vercel.json` cache headers verified (`immutable` on hashed assets, short max-age on `index.html`)
  - [ ] Open-graph image (single static SVG/PNG ~10 KB so social shares look intentional)
- **Acceptance:**
  - [ ] Lighthouse mobile performance ≥ 95
  - [ ] First-load transfer (HTML + JS + CSS) still under *Bundle budget*; font is a separate request as designed
  - [ ] Reduced-motion: full playthrough is calm; nothing pulses or twinkles
- **Dependencies:** PR 7.

### After PR 8

- [ ] Move this spec to `docs/wu-json/specs/archived/`, flip `status: implemented`
- [ ] Anything that surfaced during implementation but didn't fit becomes its own follow-up spec under `docs/wu-json/specs/`

---

## Decided (was: open questions)

- **Pixel font:** Ship `DotGothic16` via Google Fonts from PR 1; system mono is the `font-display: swap` fallback.
- **Audio:** None in v1.
- **Screen 1 choice:** No `[ decline ]` button. Only `[ accept ]` — the absent button *is* the satire.
- **Loop ceiling:** No in-game exit. Infinite loop until tab close.
- **Share button:** Ship the Web Share API button — free on supported browsers, zero bytes elsewhere.
