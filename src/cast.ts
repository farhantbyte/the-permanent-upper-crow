// The rich crow rotates per loop — each iteration of the cycle
// brings a new "founder" pitching the same scheme. Cast is
// indexed by (loop - 1) modulo the list length, so loop 1 always
// gets Benjamin Peck and loop 7 cycles back to him.
export interface RichCast {
  name: string;
  company: string;
}

export const RICH_CASTS: readonly RichCast[] = [
  { name: 'Benjamin Peck', company: 'Crow Automation Systems' },
  { name: 'Margaret Caw', company: 'Caw Labs' },
  { name: 'Edgar Crowford', company: 'Crowford Ventures' },
  { name: 'Olivia Beakerson', company: 'Beaknet' },
  { name: 'Marcus Talon', company: 'Talonchain' },
  { name: 'Felicity Plume', company: 'Plume Capital' },
];

export function getRichCast(loop: number): RichCast {
  return RICH_CASTS[(loop - 1) % RICH_CASTS.length];
}
