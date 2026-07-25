const STORAGE_KEY = 'puc:loop';

const BASE_BALANCE = 1;
const BASE_HAT_PRICE = 10;
const LOOP_FACTOR = 100;

export type ScreenIndex = 0 | 1 | 2 | 3 | 4;

export interface GameState {
  screen: ScreenIndex;
  loop: number;
  balance: number;
  hatPrice: number;
}

export interface LoopValues {
  balance: number;
  hatPrice: number;
}

export function deriveLoopValues(loop: number): LoopValues {
  const factor = LOOP_FACTOR ** Math.max(0, loop - 1);
  return {
    balance: BASE_BALANCE * factor,
    hatPrice: BASE_HAT_PRICE * factor,
  };
}

export function loadLoop(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 1;
    return Number.isFinite(n) && n >= 1 ? n : 1;
  } catch {
    return 1;
  }
}

export function saveLoop(loop: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(loop));
  } catch {
    /* localStorage unavailable (private mode, quota) — non-fatal */
  }
}
