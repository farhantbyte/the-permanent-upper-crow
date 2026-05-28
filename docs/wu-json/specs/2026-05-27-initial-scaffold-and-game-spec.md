---
status: ready
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
- **Loops forever; *feels* escalating.** No length cap — the ×100 prices and balance climbing each loop are what make the player stop.

## Non-goals

- No accounts, no server state, no analytics, no telemetry.
- No audio in v1.
- No game mechanics — story-game with single-button advance.
- No multiplayer, no leaderboards, no server-side share images.
- No 3D / WebGL / `three.js`. (Personal-website's spider lily uses WebGL; we deliberately don't.)

---

## Story (canonical script)

Dialogue is short, deadpan, lowercase except for proper nouns / brand names. The rich crow is the exception — he speaks in proper sentence case, and the formal grammar is the marker of corporate persona that sets him apart from every other voice (player, narrator, system messages). His cadence is stilted-formal businesscrow with bird puns and a slightly precarious undercurrent ("the only ethical move", "we are running out of time", "e-kaw-nomy").

### Screen 1 — *The Hat Shop*

Setting: player-crow next to a display table. Top hat sits on the table (same hat the rich crow wears). Bordered placard below the table reads `TOP HAT FOR SALE: $ 10`. HUD: `NEST WORTH: $ 1`. No storefront chrome — the hat-on-table + sign is the venue cue; an awning silhouette was tried and removed for reading as a stray gray bar.

- Tap to buy the top hat → `INSUFFICIENT FUNDS.` flash (red, persistent). After 5 taps, an escalating subtext line cycles under the flash on each subsequent tap (broke-jokes, bird puns, "have you considered onlybirds?", "stream your tapping on twitch", etc.).
- Tap `[ continue ]` → **rich crow** slides in from the right, facing the player. He already wears the same hat the player just got priced out of. His identity rotates per loop — loop 1 is *Benjamin Peck, Founder and CEO of Crow Automation Systems*; subsequent loops introduce *Margaret Caw* (Caw Labs), *Edgar Crowford* (Crowford Ventures), *Olivia Beakerson* (Beaknet), *Marcus Talon* (Talonchain), *Felicity Plume* (Plume Capital), and then the list cycles. Every iteration of the doom is being sold by a new "founder" with the same template pitch.
- His pitch streams Animal-Crossing-style line-by-line in a bordered dialogue box labeled with the founder's uppercase name; tap mid-stream skips to end of current line, tap when complete advances to the next. Template (`${name}` and `${company}` rotate per loop):
  - *"Why hello there! I'm ${name}, Founder and CEO of ${company}."*
  - *"It seems you're having... some trouble with that purchase."*
  - *"What if I told you you could earn generational wealth with just a few years of hard work?"*
  - *"At ${company}, we produce the Robo-Crow. It is an autonomous robot that automates all labor in the e-kaw-nomy."*
  - *"You must decide soon. We are running out of time before you become stuck with the under-crows."*
  - *"Equity in our venerable operation is anything but abundant."*
- After the last line, an **Employment Agreement popup** fades in over the scene (modal with a dimmed backdrop). The card carries the current loop's company name (`Crow Automation Systems`, `Caw Labs`, etc.), six numbered legalese terms ("Dedicate all labor, judgment, and waking hours to the development of Robo-Crow.", "Maintain a 12/12/7 in-office presence at our San Franchickso headquarters.", "Receive complimentary lunch and dinner on premises (mandatory).", "Acknowledge that the window is closing.", "Accept 1% equity in the Company, which the Company affirms is anything but abundant.", "Forfeit the right to wonder if there was another way."), two signature lines (Employee · ${name}, Founder & CEO), and `[ decline ]` / `[ sign ]` at the bottom. Below the signatures, **§47B** is rendered as a 3-pixel-tall fine-print paragraph — physically unreadable without zooming — containing the binding 7-loop arbitration clause the factory warning popup later references ("The arbitrator is a crow. The arbitrator is unavailable. This section is unenforceable in any jurisdiction where it has been read."). `[ decline ]` is a fake exit: each tap surfaces a different first-person reminder under the buttons (`"rent is due next month."`, `"mama crow is in the hospital remember."`, etc., ~10 lines, loops indefinitely). Only `[ sign ]` actually signs the contract. The performative refusal *is* the satire — you can perform declining indefinitely; nothing advances until you sign.
- Tap `[ sign ]` → contract fades out, dialogue box re-enables, and the rich crow delivers three celebratory follow-up lines in the same proper-sentence-case voice (`"Congratulations. I knew you weren't incompetent!"`, `"Cheers to a future of hard working fortune, and fortunate hard work."`, `"See you in the office on Sunday my love."`). Tap past the last line to advance to Screen 2.

### Screen 2 — *The Factory*

Setting: a horizontal conveyor of Robo-Crow silhouettes moving across the frame. Player-crow at a console on the left. Rich crow (loop-rotating cast — Benjamin Peck on loop 1, etc.) at the right edge.

- Tap `[ ship it ]` → conveyor begins translating (CSS transform only, no per-frame JS). Robo-Crows loop across the screen indefinitely.
- The same streaming dialogue box as Screen 1 fades in after `[ ship it ]`. The rich crow loses composure for one beat, then recovers into proper-sentence-case businesscrow. Lines:
  - *"KAWKAWKAKAWKAWKAKAW"*
  - *"We are so back."*
  - *"I can smell our investors gawking at these profits."*
  - *"Our next quarter will crush those damn Eagles."*
  - *"Great work. I'm looking forward to enjoying my— I mean our fortune very soon in our public offering."*
- Tap past the last line to advance to Screen 3. The conveyor keeps moving the whole time.

### Screen 3 — *The Newscast*

Setting: first-person view of a TV from the couch — the TV frame fills most of the viewport, the player crow is not visible (you ARE the player, slumped on the couch). Inside the TV, **Trisha Cawkanawa** (a play on Tricia Takanawa from Family Guy) anchors **Caw News Network** ("CNN") from a small news desk with a studio microphone in front of her. A `LIVE` indicator pulses in the upper-corner of the TV; a chyron cycles headlines along the bottom of the TV screen.

HUD: post-launch `NEST WORTH: $ 100` (loop 1; the next loop's starting balance, from `deriveLoopValues(loop + 1).balance`).

Trisha's report streams in the same Animal-Crossing dialogue box used on screens 1 and 2 (speaker label `TRISHA CAWKANAWA`). Caw News Network bills itself as an *independent* newsroom, which the rest of her broadcast quietly undermines — the current loop's company name (`${company}` — `Crow Automation Systems` on loop 1, then `Caw Labs`, `Crowford Ventures`, etc.) is attributed for both the good news (earnings, productivity) and the bad news (unemployment, inflation):

- *"Good evening. I'm Trisha Cawkanawa, reporting live for Caw News Network — your independent voice."*
- *"Tonight's top story: the under-crow job market has officially collapsed."*
- *"${company} reports record Q3 earnings, beating every analyst expectation."*
- *"Analysts credit ${company}'s Robo-Crow rollout for an unprecedented productivity surge."*
- *"Food prices are up 312% year over year. ${company} has issued a statement assuring viewers that this is, quote, 'fine'."*
- *"The under-crows are protesting outside our studio. We will not be covering it."*
- *"Back to you."*

Chyron strings (cycle every ~1.8s):

- `JOB MARKET COLLAPSES`
- `UNDER-CROWS PROTEST`
- `ROBO-CROW Q3 EARNINGS BEAT`
- `FOOD PRICES UP 312% Y/Y`

Tap past Trisha's last line to advance to Screen 4.

### Screen 4 — *The Spaceship*

Setting: black-on-black starfield (low-opacity white dots twinkling via opacity keyframes). Spaceship silhouette foreground. Tiny crow silhouettes filing in.

- Rich crow: *"the under-crows can't follow us. new planet. we earned this."*
- Tap to advance.

### Screen 5 — *The Arrival*

Setting: the new planet. Faint twinkling starfield above a thin horizon line; the player crow stands alone on the ground. HUD shows the post-launch nest worth (`deriveLoopValues(loop + 1).balance`).

The player crow speaks for the first time in the game, and crucially uses **proper sentence case** — the same businesscrow voice the rich crow uses. The grammar shift is the marker that the player has joined the upper class. Speaker label: `YOU`.

- *"Finally... I can enjoy my money."*
- *"..."*
- *"I should probably buy some new clothes..."*

After the last line, the crow walks off the right edge of the stage; the stars, ground, HUD, and dialogue cross-fade out under a black veil. The veil is bridged into the next mount by a body-level overlay owned by `main.ts` so the cut feels like a fade-back-in rather than a snap — the recursion is meant to feel hallucinatory, like a trip.

### Loop — *The Hat Shop (Again)*

Advancing past Screen 5 increments the loop counter, persists it via `saveLoop()`, refreshes the derived balance/hat price (×100), and re-mounts Screen 1. The player still cannot afford the hat — the gap held, even after a generational windfall. The new founder from the rotating cast appears with the same template pitch. Rich crow's opening swaps to `"the window is closing — again."` on loop ≥ 2 (deferred — not landed in this PR).

---

## Loop Escalation

The numbers do the work. No per-loop visual decay — the rising prices alongside the rising balance are the punchline.

| Element | Change per loop |
|---|---|
| Bank balance (start of loop) | × 100 |
| Hat price | × 100 |

Loop 1: balance `$ 1`, hat `$ 10`. Loop 2: `$ 100` / `$ 1,000`. Loop 3: `$ 10,000` / `$ 100,000`. The couch (Screen 3) shows next-loop's start balance as the post-launch HUD.

The loop count is **not** displayed anywhere in the UI. The player should realize the recursion themselves from the climbing prices and the repeating script. Telling them "loop 2 / ∞" lets them off the hook — the discovery is the satire. `loop` is still tracked in state so `deriveLoopValues` can scale the numbers; it just never reaches the DOM.

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
- **Rich crow:** same body silhouette, white fill, **wearing a stovepipe top hat** (crown + wider brim) integrated into the path. Same cool white glow as the player — character is what marks him as the rich crow, not color. The hat is the visual punchline; "golden" was the earlier design and got replaced by the hat because a single accessory reads as wealth more immediately than a tint.
- **Robo-Crow:** the factory output. Same body silhouette + two small antennas integrated into the path top, eye is a **square hole** instead of round (= screen/visor → robot at a glance), two clean metal "straps" wrap the chest and lower body (no rivets on the straps — they read better empty), and a single rivet at the beak-head joint suggests the beak is bolted on. All cutouts are subpaths via evenodd. No glow. Used on the factory conveyor (Screen 2) at `--color-ink-faint` and possibly elsewhere as a product reference.
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
│   │   ├── news.ts              # screen 3 (newscast)
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
  screen: 0 | 1 | 2 | 3 | 4;     // 0=store, 1=factory, 2=news, 3=ship, 4=store-again
  loop: number;                  // 1, 2, 3, …
  balance: number;               // pure function of loop
  hatPrice: number;              // pure function of loop
}
```

Only `loop` needs persisting; balance and price derive from it.

### Dev affordances

`main.ts` reads URL query params on load so you can jump straight into a screen without playing through:

- `?screen=<0..3 | store | factory | news | ship>` — mount that screen as the entry point
- `?loop=<n>` — start at a specific loop (drives the rich-crow cast rotation and the ×100 number scaling, useful for testing later loops without grinding)

Both are no-ops if absent; harmless to leave shipped in production.

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

- [x] **PR 0** — Spec
- [x] **PR 1** — Scaffold
- [x] **PR 2** — Shared primitives
- [ ] **PR 3** — Screen 1: the hat shop
- [ ] **PR 4** — Screen 2: the factory
- [ ] **PR 5** — Screen 3: the newscast
- [ ] **PR 6** — Screen 4: the spaceship
- [ ] **PR 7** — Loop wiring + Screen 5: the arrival
- [ ] **PR 8** — Polish
- [ ] Spec archived

---

### PR 0 — Spec (this branch: `feat/initial-scaffold-and-spec`)

- **Goal:** land this spec doc, no code.
- **Files:**
  - [x] `docs/wu-json/specs/2026-05-27-initial-scaffold-and-game-spec.md`
- **Acceptance:**
  - [x] Spec reviewed
  - [x] `status:` flipped from `draft` → `ready` before PR 1 starts

### PR 1 — Scaffold (`feat/scaffold-vite-vanilla-ts`)

- **Goal:** Vite + vanilla TS + Tailwind v4 deployed to Vercel as a black screen.
- **Adds:**
  - [x] `package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`
  - [x] `index.html` with `<html data-theme="dark">`, viewport-fit meta, `<div id="app">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, DotGothic16 Google Fonts `<link>` with `font-display: swap`
  - [x] `src/main.ts` — mounts to `#app`, renders centered `permanent upper-crow` title in DotGothic16 (system mono during swap) using palette tokens
  - [x] `src/index.css` — full palette block, Tailwind v4 setup, `--font-pixel` token, `@layer base` body styles (black surface, white ink) ported from `personal-website`
  - [x] `public/favicon.svg` (minimal white crow silhouette)
  - [x] `.gitignore`, `README.md` (one paragraph, links to this spec)
- **Acceptance:**
  - [x] `bun install && bun run dev` boots the black page with the title
  - [x] `bun run build` produces `dist/` ≤ 15 KB gzipped (font excluded; it's third-party)
  - [x] Title renders in DotGothic16 after swap; system mono visible during swap (no FOIT)
  - [ ] Deployed to Vercel, renders on iOS Safari + Chrome desktop
  - [x] No React, no router, no runtime deps beyond TS
- **Dependencies:** none.

### PR 2 — Shared primitives (`feat/crow-svg-and-primitives`)

- **Goal:** visual + structural building blocks every screen reuses. No gameplay yet.
- **Adds:**
  - [x] `src/crow.ts` — inline SVG for player crow (idle), rich crow (idle, wears top hat), robo-crow (square eye + antennas), background crow. `variant: "player" | "rich" | "background" | "robo"` selects glow class and SVG.
  - [x] `src/ui.ts` — pure functions returning DOM nodes for HUD (balance only — loop count is intentionally hidden), primary `[ button ]`, `[ skip ]` corner control. No screen-specific logic.
  - [x] `src/state.ts` — `GameState` type, `deriveLoopValues(loop)` pure fn, `loadLoop()` / `saveLoop()` stubs (single `localStorage` key).
  - [x] `src/screens/types.ts` — `Screen` interface (`mount(host, ctx) → cleanup`).
  - [x] CSS: `crow-breathe` keyframes (port of `lily-breathe`), `.crow-glow-player`, `.crow-glow-rich`, button base styles, `prefers-reduced-motion` overrides.
  - [x] Throwaway dev-only "kitchen sink" route in `main.ts` — renders all three crow variants + HUD + button. Deleted in PR 3.
- **Acceptance:**
  - [x] Kitchen-sink page shows all four crows side-by-side, player + rich (with top hat) glowing, robo (square eye + antennas) and background flat
  - [x] Reduced-motion: halo holds steady, doesn't pulse
  - [x] Bundle still under budget
- **Dependencies:** PR 1.

### PR 3 — Screen 1: the hat shop (`feat/screen-1-store`)

- **Goal:** first playable beat. Top hat is too expensive, rich crow (rotating cast per loop) delivers his streaming pitch, and `[ accept ]` advances to a "screen 2 coming soon" placeholder. `[ decline ]` is a sibling button that surfaces internal-monologue excuses but doesn't actually advance.
- **Adds:**
  - [x] `src/screens/store.ts` — hat-on-table display with `TOP HAT FOR SALE: $ 10` placard, HUD `NEST WORTH: $ 1`, player crow, rich crow entrance (CSS translate from off-right). No skip button on this screen.
  - [x] `INSUFFICIENT FUNDS.` flash on first tap
  - [x] Streaming Animal-Crossing-style dialogue box with speaker label; **Employment Agreement popup** appears after the last line with `[ decline ]` / `[ accept ]` inside — decline cycles internal-monologue excuses but never advances
  - [x] Wire `main.ts` to mount Screen 1 by default, removing kitchen sink
  - [x] Placeholder "screen 2 coming soon" as the next screen so advance works end-to-end in this PR
- **Acceptance:**
  - [ ] On mobile, price tag, HUD, both crows, dialogue, and the single button fit one viewport — no scroll
  - [ ] Rich crow enters with a smooth transform; reduced-motion just fades it in
  - [ ] `[ accept ]` advances to the placeholder
- **Dependencies:** PR 2.

### PR 4 — Screen 2: the factory (`feat/screen-2-factory`)

- **Goal:** launch beat. Conveyor of Robo-Crows, `[ ship it ]`, rich crow's five-line celebration in the same streaming dialogue box.
- **Adds:**
  - [x] `src/screens/factory.ts` — player crow + console (deferred for first pass — just the player crow on the left), Robo-Crow conveyor that translate-Xs on a continuous CSS loop after `[ ship it ]`, rich crow on the right edge (mirrored to face the conveyor)
  - [x] Extract the streaming dialogue box from `src/screens/store.ts` into `src/dialogue.ts` (shared primitive `createDialogue({ speaker })` with `play(lines)` / `setActive(bool)` / `onAdvance(cb)`) and reuse it for the rich crow's five celebration lines
  - [x] Extract the loop-rotating cast into `src/cast.ts` so both screens share it
  - [x] Tap past the last line → advance to the next screen (placeholder in this PR)
  - [x] Replace the "screen 2 — coming soon" placeholder from PR 3 (placeholder now stands in for Screen 3)
- **Acceptance:**
  - [ ] Conveyor runs via CSS keyframes / transforms only, no per-frame JS
  - [ ] Reduced-motion: conveyor pauses or moves slowly; dialogue still streams character-by-character at the same pace
  - [ ] Bundle delta is small — most of the new code is the dialogue extraction, which is shared with Screen 1
- **Dependencies:** PR 3.

### PR 5 — Screen 3: the newscast (`feat/screen-3-news`)

- **Goal:** rich-but-world-on-fire beat. First-person TV view with Trisha Cawkanawa anchoring Caw News Network from inside the TV frame; cycling chyron at the bottom.
- **Adds:**
  - [ ] `src/screens/news.ts` — large TV-frame silhouette dominating the viewport; inside, a reporter crow at a small news desk, a pulsing `LIVE` indicator in the upper corner, and a chyron strip at the bottom of the TV
  - [ ] Trisha Cawkanawa's six-line report uses the shared `createDialogue` primitive (speaker label `TRISHA CAWKANAWA`); tap past the last line advances to Screen 4 placeholder
  - [ ] Chyron cycler — array of 4 strings in pixel font, swapped every ~1.8 s via `setInterval`, cleared on cleanup. No animation library.
  - [ ] HUD shows post-launch balance (`$ 100`) from `deriveLoopValues(loop + 1).balance` for loop 1
  - [ ] Add a `couch`/`news` entry to `?screen=` in `main.ts` so dev jump still works
- **Acceptance:**
  - [ ] Cleanup clears the chyron interval and dialogue timers (unmount + remount doesn't leak)
  - [ ] DotGothic16 renders in the chyron + speaker label; system-mono swap fallback also legible at iPhone size
  - [ ] Tap past Trisha's last line advances to the placeholder
- **Dependencies:** PR 4.

### PR 6 — Screen 4: the spaceship (`feat/screen-4-ship`)

- **Goal:** abandonment beat. Starfield + ship + crows boarding.
- **Adds:**
  - [ ] `src/screens/ship.ts` — starfield (50–80 absolutely-positioned dots, staggered opacity keyframes; one CSS-driven layer, no JS)
  - [ ] Ship silhouette foreground
  - [ ] Row of background crows translating toward the ship over ~2 s
  - [ ] Rich crow dialogue
- **Acceptance:**
  - [ ] Starfield doesn't tank FPS on mid-range Android Chrome (scrolling/tapping stays responsive)
  - [ ] Reduced-motion: stars steady, ship still, crows pre-positioned at the ship
- **Dependencies:** PR 5.

### PR 7 — Loop wiring + Screen 5: the arrival (`feat/loop-recursion-and-escalation`)

- **Goal:** make the recursion real. Add the arrival interstitial after the spaceship, then close the loop back to the hat shop with bumped numbers and a new founder. This is where the satire lands.
- **Adds:**
  - [x] `src/screens/arrival.ts` — new planet stage (starfield + horizon + lone player crow), `YOU` dialogue in proper sentence case, walk-off + veil fade on advance
  - [x] State: increment `loop` on arrival → store transition in `main.ts`, persist via `saveLoop()`, refresh derived balance/price from `deriveLoopValues`
  - [x] Body-level `.loop-veil` owned by `main.ts` bridges arrival's black veil into the next mount so the cut feels like a fade-back-in (the "trip" continuity)
  - [x] Remove `src/screens/placeholder.ts` — arrival replaces it as the fifth screen
  - [x] `deriveLoopValues(loop)` returns ×100 balance/price, monotonically (already landed in PR 2; verified end-to-end here)
  - [ ] Rich crow opening swaps to `"— again."` on loop ≥ 2 *(deferred — out of scope for this PR; can be folded into PR 8 or a small follow-up)*
- **Acceptance:**
  - [ ] Hard refresh mid-loop-3 returns to screen 1 of loop 3 (not loop 1)
  - [ ] Clearing `localStorage` resets to loop 1
  - [ ] Numbers stay readable through loop 5 (no HUD pill overflow)
  - [ ] Arrival → store transition fades through black (no hard snap)
  - [ ] Reduced motion: stars steady, crow vanishes via opacity instead of translate
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
- **Screen 1 choice:** `[ decline ]` exists as a sibling of `[ accept ]`, but it never advances — every tap surfaces a different first-person bill the player is on the hook for. The performative refusal is the satire; the absent *real* decline is the trap.
- **Loop ceiling:** No in-game exit. Infinite loop until tab close.
- **Share button:** Ship the Web Share API button — free on supported browsers, zero bytes elsewhere.
