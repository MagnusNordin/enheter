import { FAMILIES, FAMILY_KEYS, isFamilyKey } from './families.ts';

// The old AngularJS app's data (parts.json + units.json), kept as the source of truth.
const OLD_PARTS = [
  { prefix: 'k', factor: 1000 },
  { prefix: 'h', factor: 100 },
  { prefix: '', factor: 1 },
  { prefix: 'd', factor: 0.1 },
  { prefix: 'c', factor: 0.01 },
  { prefix: 'm', factor: 0.001 },
];
const OLD_UNITS: Record<string, number[]> = {
  g: [0, 1, 2, 5],
  l: [2, 3, 4, 5],
  m: [0, 2, 3, 4, 5],
};

describe('FAMILIES', () => {
  it('has gram, meter and liter in that order', () => {
    expect(FAMILY_KEYS).toEqual(['gram', 'meter', 'liter']);
    expect(Object.keys(FAMILIES).sort()).toEqual([...FAMILY_KEYS].sort());
  });

  it.each(FAMILY_KEYS)('%s has one factor per step', (key) => {
    const family = FAMILIES[key];
    expect(family.key).toBe(key);
    expect(family.factors).toHaveLength(family.units.length - 1);
  });

  it.each(FAMILY_KEYS)('%s matches the old app units and factors', (key) => {
    const family = FAMILIES[key];
    const indexes = OLD_UNITS[family.symbol]!;
    const parts = indexes.map((i) => OLD_PARTS[i]!);

    expect(family.units).toEqual(parts.map((p) => p.prefix + family.symbol));
    const factors = parts.slice(1).map((p, i) => Math.round(parts[i]!.factor / p.factor));
    expect(family.factors).toEqual(factors);
  });

  it('includes the base unit in each family', () => {
    for (const key of FAMILY_KEYS) {
      expect(FAMILIES[key].units).toContain(FAMILIES[key].symbol);
    }
  });

  it('has Swedish labels', () => {
    expect(FAMILY_KEYS.map((k) => FAMILIES[k].kind)).toEqual(['Vikt', 'Längd', 'Volym']);
    expect(FAMILY_KEYS.map((k) => FAMILIES[k].name)).toEqual(['gram', 'meter', 'liter']);
  });

  it('uses ×100 for hg → g and ×1000 for g → mg', () => {
    const { units, factors } = FAMILIES.gram;
    expect(factors[units.indexOf('hg')]).toBe(100);
    expect(factors[units.indexOf('g')]).toBe(1000);
  });
});

describe('isFamilyKey', () => {
  it.each(['gram', 'meter', 'liter'])('accepts %s', (key) => {
    expect(isFamilyKey(key)).toBe(true);
  });

  it.each([['g'], ['Gram'], [''], [null], [undefined], [1], [{}]])('rejects %j', (value) => {
    expect(isFamilyKey(value)).toBe(false);
  });
});
