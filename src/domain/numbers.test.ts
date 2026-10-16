import { formatNumber, isCorrect, parseAnswer, roundAnswer } from './numbers.ts';

const NBSP = ' ';

describe('parseAnswer', () => {
  it.each([
    ['4', 4],
    ['400', 400],
    ['0,5', 0.5],
    ['0.5', 0.5],
    [',5', 0.5],
    ['.5', 0.5],
    ['0,08', 0.08],
    [' 4 ', 4],
    ['80 000', 80000],
    [`80${NBSP}000`, 80000],
    ['80 000', 80000],
    ['80000,0', 80000],
    ['007', 7],
  ])('reads %j as %d', (text, expected) => {
    expect(parseAnswer(text)).toBe(expected);
  });

  it.each([
    [''],
    ['   '],
    ['-1'],
    ['+1'],
    ['abc'],
    ['4 l'],
    ['1,2,3'],
    ['1.2.3'],
    ['1,'],
    ['1.'],
    [','],
    ['1e3'],
    ['Infinity'],
    ['0x10'],
    ['½'],
  ])('rejects %j', (text) => {
    expect(parseAnswer(text)).toBeNull();
  });
});

describe('isCorrect', () => {
  it('matches equal numbers', () => {
    expect(isCorrect(4, 4)).toBe(true);
    expect(isCorrect(0.08, 0.08)).toBe(true);
    expect(isCorrect(80000, 80000)).toBe(true);
  });

  it('tolerates float noise', () => {
    expect(isCorrect(0.1 + 0.2, 0.3)).toBe(true);
    expect(isCorrect(80 / 1000, 0.08)).toBe(true);
  });

  it('rejects different numbers', () => {
    expect(isCorrect(400, 4)).toBe(false);
    expect(isCorrect(0.8, 0.08)).toBe(false);
    expect(isCorrect(0.001, 0.002)).toBe(false);
    expect(isCorrect(80001, 80000)).toBe(false);
  });

  it('rejects an unparsable answer', () => {
    expect(isCorrect(null, 4)).toBe(false);
    expect(isCorrect(null, 0)).toBe(false);
  });
});

describe('formatNumber', () => {
  it.each([
    [4, '4'],
    [0.5, '0,5'],
    [0.08, '0,08'],
    [0.000001, '0,000001'],
    [1000, `1${NBSP}000`],
    [80000, `80${NBSP}000`],
    [80000.5, `80${NBSP}000,5`],
  ])('formats %d as %j', (n, expected) => {
    expect(formatNumber(n)).toBe(expected);
  });

  it('round-trips through parseAnswer', () => {
    for (const n of [4, 0.5, 0.08, 0.01, 80000, 0.000001]) {
      expect(parseAnswer(formatNumber(n))).toBe(n);
    }
  });
});

describe('roundAnswer', () => {
  it('removes float noise', () => {
    expect(roundAnswer(0.07999999999999999)).toBe(0.08);
    expect(roundAnswer(0.1 + 0.2)).toBe(0.3);
  });

  it('keeps whole numbers and six decimals', () => {
    expect(roundAnswer(80000)).toBe(80000);
    expect(roundAnswer(0.000001)).toBe(0.000001);
  });
});
