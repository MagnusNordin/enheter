import type { Family } from './families.ts';
import { formatNumber } from './numbers.ts';
import type { Question } from './question.ts';

export type UnitRole = 'from' | 'to' | 'none';

export interface LadderUnit {
  type: 'unit';
  unit: string;
  role: UnitRole;
}

export interface LadderStep {
  type: 'step';
  factor: number;
  /** True for the step the current question crosses. */
  active: boolean;
  /** Direction of the current question on the active step, else null. */
  direction: 'down' | 'up' | null;
}

export type LadderItem = LadderUnit | LadderStep;

/** "Enhetsstegen": units from largest to smallest with the steps between them. */
export function buildLadder(family: Family, question: Question | null): LadderItem[] {
  const items: LadderItem[] = [];
  family.units.forEach((unit, k) => {
    if (k > 0) {
      const active = question !== null && question.step === k - 1;
      items.push({
        type: 'step',
        factor: family.factors[k - 1]!,
        active,
        direction: active ? (question.down ? 'down' : 'up') : null,
      });
    }
    const role: UnitRole = unit === question?.from ? 'from' : unit === question?.to ? 'to' : 'none';
    items.push({ type: 'unit', unit, role });
  });
  return items;
}

/**
 * Text over a step. Wide (desktop) shows the direction with an arrow:
 * "×10 →" or "← ÷10". Compact (mobile) draws the arrow on the line instead.
 */
export function stepLabel(step: LadderStep, compact: boolean): string {
  const factor = formatNumber(step.factor);
  if (step.direction === 'down') return compact ? `×${factor}` : `×${factor} →`;
  if (step.direction === 'up') return compact ? `÷${factor}` : `← ÷${factor}`;
  return `×${factor}`;
}

export const UNIT_CAPTIONS: Readonly<Record<UnitRole, string>> = {
  from: 'från',
  to: 'till',
  none: '',
};
