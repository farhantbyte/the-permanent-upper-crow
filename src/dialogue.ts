// Animal-Crossing-style streaming dialogue box. Each tap on the
// element either skips to the end of the current streaming line
// or advances to the next one. When the user taps past the last
// line, the registered `onAdvance` callback fires — what that
// means is up to the caller (advance screen, show a popup, etc.).

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
  speakerEl.textContent = opts.speaker;

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

  const streamCurrent = () => {
    streaming = true;
    indicator.classList.remove('shown');
    text.textContent = '';
    charIdx = 0;
    const line = lines[lineIdx];
    const tick = () => {
      if (charIdx >= line.length) {
        onLineComplete();
        return;
      }
      text.textContent = line.slice(0, charIdx + 1);
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

  const onClick = () => {
    if (!active) return;
    if (streaming) {
      finishCurrent();
    } else if (lineIdx < lines.length - 1) {
      lineIdx += 1;
      streamCurrent();
    } else {
      advanceCb?.();
    }
  };

  el.addEventListener('click', onClick);

  return {
    el,
    play(newLines) {
      clearStream();
      lines = newLines;
      lineIdx = 0;
      streamCurrent();
    },
    setSpeaker(name) {
      speakerEl.textContent = name;
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
      el.removeEventListener('click', onClick);
    },
  };
}
