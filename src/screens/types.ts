import type { GameState } from '../state';

export interface GameContext {
  state: GameState;
  advance(): void;
  /**
   * How long (in ms) the incoming screen should wait before
   * surfacing voiced content like streaming dialogue. Set by
   * main.ts when a transition spawns an overlay (e.g. the
   * ship → arrival chapter card) that's still covering the
   * screen at mount time. Screens default to 0 / their own
   * built-in delay when this is unset.
   */
  entryDelayMs?: number;
}

export interface Screen {
  mount(host: HTMLElement, ctx: GameContext): () => void;
}
