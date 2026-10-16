import { FAMILIES, FAMILY_KEYS } from './families.ts';
import { buildLadder, stepLabel, UNIT_CAPTIONS, type LadderStep } from './ladder.ts';
import type { Question } from './question.ts';

const NBSP = ' ';

const dlToL: Question = { value: 40, from: 'dl', to: 'l', answer: 4, step: 0, down: false };
const mToDm: Question = { value: 30, from: 'm', to: 'dm', answer: 300, step: 1, down: true };

describe('buildLadder', () => {
  it.each(FAMILY_KEYS)('%s alternates units and steps', (key) => {
    const family = FAMILIES[key];
    const items = buildLadder(family, null);
    expect(items).toHaveLength(family.units.length * 2 - 1);
    items.forEach((item, i) => expect(item.type).toBe(i % 2 === 0 ? 'unit' : 'step'));
    expect(items.filter((i) => i.type === 'unit').map((i) => i.unit)).toEqual(family.units);
    expect(items.filter((i) => i.type === 'step').map((i) => i.factor)).toEqual(family.factors);
  });

  it('marks from and to units for an up question', () => {
    const items = buildLadder(FAMILIES.liter, dlToL);
    expect(items).toEqual([
      { type: 'unit', unit: 'l', role: 'to' },
      { type: 'step', factor: 10, active: true, direction: 'up' },
      { type: 'unit', unit: 'dl', role: 'from' },
      { type: 'step', factor: 10, active: false, direction: null },
      { type: 'unit', unit: 'cl', role: 'none' },
      { type: 'step', factor: 10, active: false, direction: null },
      { type: 'unit', unit: 'ml', role: 'none' },
    ]);
  });

  it('marks the active step and direction for a down question', () => {
    const items = buildLadder(FAMILIES.meter, mToDm);
    const steps = items.filter((i): i is LadderStep => i.type === 'step');
    expect(steps.map((s) => s.active)).toEqual([false, true, false, false]);
    expect(steps[1]!.direction).toBe('down');
    expect(items.filter((i) => i.type === 'unit').map((i) => i.role)).toEqual([
      'none',
      'from',
      'to',
      'none',
      'none',
    ]);
  });

  it('has nothing highlighted without a question', () => {
    const items = buildLadder(FAMILIES.gram, null);
    for (const item of items) {
      if (item.type === 'unit') expect(item.role).toBe('none');
      else expect(item).toMatchObject({ active: false, direction: null });
    }
  });
});

describe('stepLabel', () => {
  const step = (factor: number, direction: LadderStep['direction']): LadderStep => ({
    type: 'step',
    factor,
    active: direction !== null,
    direction,
  });

  it('shows the factor on inactive steps', () => {
    expect(stepLabel(step(10, null), false)).toBe('×10');
    expect(stepLabel(step(10, null), true)).toBe('×10');
  });

  it('shows direction arrows on wide screens', () => {
    expect(stepLabel(step(10, 'down'), false)).toBe('×10 →');
    expect(stepLabel(step(10, 'up'), false)).toBe('← ÷10');
  });

  it('leaves arrows out on compact screens', () => {
    expect(stepLabel(step(10, 'down'), true)).toBe('×10');
    expect(stepLabel(step(10, 'up'), true)).toBe('÷10');
  });

  it('formats big factors the Swedish way', () => {
    expect(stepLabel(step(1000, null), false)).toBe(`×1${NBSP}000`);
    expect(stepLabel(step(1000, 'up'), false)).toBe(`← ÷1${NBSP}000`);
  });
});

describe('UNIT_CAPTIONS', () => {
  it('labels from and to in Swedish', () => {
    expect(UNIT_CAPTIONS).toEqual({ from: 'från', to: 'till', none: '' });
  });
});
