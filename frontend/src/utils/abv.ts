// src/utils/abv.ts
// FR-7 Alcohol Calculator: compute total drink ABV from components
// Each component: volume in mL and ABV as a percent (e.g., 40 for 40%)

export type Component = { volumeMl: number; abvPercent: number };

/**
 * Returns total ABV% of a mixed drink, rounded to 1 decimal (0..100).
 * Example: 50 mL 40% + 50 mL 0% => 20.0%
 */
export function calcTotalABV(components: Component[]): number {
  if (!Array.isArray(components) || components.length === 0) return 0;

  let totalMl = 0;
  let ethanolMl = 0;

  for (const c of components) {
    if (c && c.volumeMl > 0 && c.abvPercent >= 0) {
      totalMl += c.volumeMl;
      ethanolMl += c.volumeMl * (c.abvPercent / 100);
    }
  }
  if (totalMl === 0) return 0;

  const abv = (ethanolMl / totalMl) * 100;
  return Math.round(abv * 10) / 10; // 1 decimal
}
