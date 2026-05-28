// Animal-Crossing-style streaming dialogue box. Each tap on the
// element either skips to the end of the current streaming line
// or advances to the next one. When the user taps past the last
// line, the registered `onAdvance` callback fires — what that
// means is up to the caller (advance screen, show a popup, etc.).

import { playAdvance, playBlip } from './audio';

// Voice blips are emitted on alphanumeric characters only and
// throttled to every Nth such char so a 28 ms/char stream
// doesn't fuse into a single tone. Roughly one blip every
// 90–100 ms feels close to AC's syllable cadence.
const BLIP_EVERY_N_CHARS = 3;

export interface DialogueHandle {
  /** The root DOM element. Caller is responsible for placement. */
  el: HTMLElement;
  /** Start streaming a (new) list of lines. Resets line index. */
  play(lines: readonly string[]): void;
  /** Change the speaker label shown above the body. */
  setSpeaker(name: string): void;
  /**
   * Enable/disable tap handling. When disabled, the cursor goes
   * back to default and the ▼ indicator is hidden. Used while a
   * modal popup is covering the dialogue box.
   */
  setActive(active: boolean): void;
  /** Register the "tap past the last line" callback. */
  onAdvance(callback: () => void): void;
  /** Clear timers and listeners. Caller removes the element. */
  cleanup(): void;
}

export interface DialogueOptions {
  speaker: string;
  msPerChar?: number;
}

const DEFAULT_MS_PER_CHAR = 28;

export function createDialogue(opts: DialogueOptions): DialogueHandle {
  const el = document.createElement('div');
  el.classList.add('dialogue-box', 'reveal');

  const speakerEl = document.createElement('div');
  speakerEl.classList.add('dialogue-speaker');

  const speakerName = document.createElement('span');
  speakerName.classList.add('dialogue-speaker-name');
  speakerName.textContent = opts.speaker;

  // Keyboard hint — only visible on desktop (hover + fine
  // pointer) via the media query in index.css. Mobile users get
  // an unadorned speaker label.
  const kbdHint = document.createElement('span');
  kbdHint.classList.add('dialogue-kbd-hint');
  kbdHint.setAttribute('aria-hidden', 'true');
  kbdHint.innerHTML =
    '<kbd>enter</kbd><span class="dialogue-kbd-sep">or</span><kbd>space</kbd>';

  speakerEl.append(speakerName, kbdHint);

  const body = document.createElement('div');
  body.classList.add('dialogue-body');

  const text = document.createElement('span');
  text.classList.add('dialogue-text');

  const indicator = document.createElement('span');
  indicator.classList.add('dialogue-indicator');
  indicator.setAttribute('aria-hidden', 'true');
  indicator.textContent = '▼';

  body.append(text, indicator);
  el.append(speakerEl, body);

  const msPerChar = opts.msPerChar ?? DEFAULT_MS_PER_CHAR;

  let lines: readonly string[] = [];
  let lineIdx = 0;
  let charIdx = 0;
  let streamTimer: number | null = null;
  let streaming = false;
  let active = true;
  // Guards the advance callback from firing twice for the same
  // line set. Without it, a fast double-tap (or Enter held down)
  // past the last line would fire `advanceCb` more than once and
  // skip the next screen. Cleared whenever `play()` is called.
  let advanced = false;
  let advanceCb: (() => void) | null = null;

  const clearStream = () => {
    if (streamTimer !== null) {
      window.clearTimeout(streamTimer);
      streamTimer = null;
    }
  };

  const onLineComplete = () => {
    streaming = false;
    streamTimer = null;
    indicator.classList.add('shown');
  };

  let blipCounter = 0;

  const streamCurrent = () => {
    streaming = true;
    indicator.classList.remove('shown');
    text.textContent = '';
    charIdx = 0;
    blipCounter = 0;
    const line = lines[lineIdx];
    const tick = () => {
      if (charIdx >= line.length) {
        onLineComplete();
        return;
      }
      const ch = line[charIdx];
      text.textContent = line.slice(0, charIdx + 1);
      if (/[a-z0-9]/i.test(ch)) {
        if (blipCounter % BLIP_EVERY_N_CHARS === 0) playBlip();
        blipCounter += 1;
      }
      charIdx += 1;
      streamTimer = window.setTimeout(tick, msPerChar);
    };
    tick();
  };

  const finishCurrent = () => {
    clearStream();
    text.textContent = lines[lineIdx];
    charIdx = lines[lineIdx].length;
    onLineComplete();
  };

  const tryAdvance = () => {
    if (!active) return;
    // Nothing to do until the screen calls play() with lines.
    // Guards against keypresses landing in the gap between mount
    // and the first dialogue.play().
    if (lines.length === 0) return;
    if (advanced) return;
    if (streaming) {
      finishCurrent();
    } else if (lineIdx < lines.length - 1) {
      lineIdx += 1;
      playAdvance();
      streamCurrent();
    } else {
      advanced = true;
      playAdvance();
      advanceCb?.();
    }
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    // Don't hijack Enter/Space when a focusable control owns it
    // — focused buttons should still activate on their own keys.
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }
    if (!active) return;
    if (lines.length === 0) return;
    // Stops Space from scrolling the page.
    e.preventDefault();
    tryAdvance();
  };

  el.addEventListener('click', tryAdvance);
  window.addEventListener('keydown', onKeydown);

  return {
    el,
    play(newLines) {
      clearStream();
      lines = newLines;
      lineIdx = 0;
      advanced = false;
      streamCurrent();
    },
    setSpeaker(name) {
      speakerName.textContent = name;
    },
    setActive(value) {
      active = value;
      if (!value) {
        el.classList.add('done');
        indicator.classList.remove('shown');
      } else {
        el.classList.remove('done');
      }
    },
    onAdvance(cb) {
      advanceCb = cb;
    },
    cleanup() {
      clearStream();
      el.removeEventListener('click', tryAdvance);
      window.removeEventListener('keydown', onKeydown);
    },
  };
}
