export type FamilyKey = 'gram' | 'meter' | 'liter';

export interface Family {
  key: FamilyKey;
  /** Base unit symbol shown large on the start card. */
  symbol: string;
  name: string;
  /** Upper-case kicker on the start card: "Vikt", "Längd", "Volym". */
  kind: string;
  /** Units from largest to smallest. */
  units: readonly string[];
  /** `factors[i]` converts one `units[i]` into `units[i + 1]`. */
  factors: readonly number[];
}

// Same units and order as the old app's units.json + parts.json.
// gram skips dag, dg and cg, so hg → g is ×100 and g → mg is ×1000.
// (The design prototype had hg → g as ×10, which is wrong.)
export const FAMILIES: Readonly<Record<FamilyKey, Family>> = {
  gram: {
    key: 'gram',
    symbol: 'g',
    name: 'gram',
    kind: 'Vikt',
    units: ['kg', 'hg', 'g', 'mg'],
    factors: [10, 100, 1000],
  },
  meter: {
    key: 'meter',
    symbol: 'm',
    name: 'meter',
    kind: 'Längd',
    units: ['km', 'm', 'dm', 'cm', 'mm'],
    factors: [1000, 10, 10, 10],
  },
  liter: {
    key: 'liter',
    symbol: 'l',
    name: 'liter',
    kind: 'Volym',
    units: ['l', 'dl', 'cl', 'ml'],
    factors: [10, 10, 10],
  },
};

export const FAMILY_KEYS: readonly FamilyKey[] = ['gram', 'meter', 'liter'];

export function isFamilyKey(value: unknown): value is FamilyKey {
  return typeof value === 'string' && (FAMILY_KEYS as readonly string[]).includes(value);
}
