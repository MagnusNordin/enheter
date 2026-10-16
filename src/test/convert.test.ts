import { convert } from './convert.ts';

describe('convert (test helper)', () => {
  it('converts down and up within a family', () => {
    expect(convert(40, 'l', 'dl')).toBe(400);
    expect(convert(40, 'dl', 'l')).toBe(4);
    expect(convert(20, 'hg', 'g')).toBe(2000);
    expect(convert(80, 'm', 'km')).toBe(0.08);
  });

  it('converts across several steps', () => {
    expect(convert(1, 'km', 'mm')).toBe(1_000_000);
    expect(convert(1, 'kg', 'mg')).toBe(1_000_000);
  });

  it('rejects units from different families', () => {
    expect(() => convert(1, 'kg', 'l')).toThrow();
  });
});
