import { buildRuler, majorEvery } from './ruler.ts';

describe('majorEvery', () => {
  it('is 5 on wide screens', () => {
    expect(majorEvery(30, false)).toBe(5);
    expect(majorEvery(60, false)).toBe(5);
  });

  it('is 10 on compact screens only for rounds over 30', () => {
    expect(majorEvery(30, true)).toBe(5);
    expect(majorEvery(31, true)).toBe(10);
    expect(majorEvery(60, true)).toBe(10);
  });
});

describe('buildRuler', () => {
  it('has one tick per question plus zero', () => {
    const ticks = buildRuler({ total: 30, current: 0, checked: false, compact: false });
    expect(ticks).toHaveLength(31);
    expect(ticks.map((t) => t.index)).toEqual(Array.from({ length: 31 }, (_, i) => i));
  });

  it('marks every 5th tick and the last as major, with labels', () => {
    const ticks = buildRuler({ total: 12, current: 5, checked: true, compact: false });
    expect(ticks.filter((t) => t.major).map((t) => t.index)).toEqual([0, 5, 10, 12]);
    expect(ticks.filter((t) => t.label !== null).map((t) => t.label)).toEqual([
      '0',
      '5',
      '10',
      '12',
    ]);
  });

  it('labels every 10th tick on compact screens with long rounds', () => {
    const ticks = buildRuler({ total: 40, current: 20, checked: true, compact: true });
    expect(ticks.filter((t) => t.major).map((t) => t.index)).toEqual([0, 10, 20, 30, 40]);
  });

  it('highlights the next tick while a question is unanswered', () => {
    const ticks = buildRuler({ total: 30, current: 3, checked: false, compact: false });
    expect(ticks.slice(0, 6).map((t) => t.state)).toEqual([
      'done',
      'done',
      'done',
      'done',
      'current',
      'pending',
    ]);
    expect(ticks.filter((t) => t.state === 'current')).toHaveLength(1);
  });

  it('fills the current tick once the question is checked', () => {
    const ticks = buildRuler({ total: 30, current: 3, checked: true, compact: false });
    expect(ticks.filter((t) => t.state === 'current')).toHaveLength(0);
    expect(ticks.filter((t) => t.state === 'done').map((t) => t.index)).toEqual([0, 1, 2, 3, 4]);
  });

  it('hides the label on a major tick while it is current', () => {
    const ticks = buildRuler({ total: 30, current: 4, checked: false, compact: false });
    expect(ticks[5]).toEqual({ index: 5, state: 'current', major: true, label: null });
  });

  it('starts with only zero done', () => {
    const ticks = buildRuler({ total: 5, current: 0, checked: false, compact: false });
    expect(ticks.map((t) => t.state)).toEqual([
      'done',
      'current',
      'pending',
      'pending',
      'pending',
      'pending',
    ]);
  });

  it('is fully done after the last question is checked', () => {
    const ticks = buildRuler({ total: 5, current: 4, checked: true, compact: false });
    expect(ticks.every((t) => t.state === 'done')).toBe(true);
  });

  it('never counts past the total', () => {
    const ticks = buildRuler({ total: 3, current: 5, checked: true, compact: false });
    expect(ticks).toHaveLength(4);
    expect(ticks.every((t) => t.state === 'done')).toBe(true);
  });
});
