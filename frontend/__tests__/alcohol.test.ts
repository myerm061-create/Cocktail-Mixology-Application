import { abvToGrams } from '../src/utils/alcohol';

describe('alcohol math', () => {
  test('converts ml and abv% to grams of pure alcohol', () => {
    expect(abvToGrams(150, 40)).toBeCloseTo(47.34, 2);
  });

  test('handles zero input', () => {
    expect(abvToGrams(0, 50)).toBe(0);
  });
});
