export type TickState = 'done' | 'current' | 'pending';

export interface Tick {
  index: number;
  state: TickState;
  major: boolean;
  /** Number printed under a major tick; null when hidden. */
  label: string | null;
}

export interface RulerInput {
  total: number;
  /** Zero-based index of the question being answered. */
  current: number;
  /** Whether the current question has been checked. */
  checked: boolean;
  /** Narrow screens with long rounds label every 10th tick instead of every 5th. */
  compact: boolean;
}

export function majorEvery(total: number, compact: boolean): number {
  return compact && total > 30 ? 10 : 5;
}

/** The yellow "folding rule" progress strip: one tick per question, plus 0. */
export function buildRuler({ total, current, checked, compact }: RulerInput): Tick[] {
  const every = majorEvery(total, compact);
  const answered = Math.min(total, current + (checked ? 1 : 0));
  const ticks: Tick[] = [];
  for (let i = 0; i <= total; i++) {
    const major = i % every === 0 || i === total;
    const isCurrent = !checked && i === current + 1;
    ticks.push({
      index: i,
      state: isCurrent ? 'current' : i <= answered ? 'done' : 'pending',
      major,
      label: major && !isCurrent ? String(i) : null,
    });
  }
  return ticks;
}
