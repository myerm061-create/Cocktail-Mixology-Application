// __tests__/abv.test.ts
// Test ID: TC-ABV-01 / TC-ABV-02
// Linked Requirement: FR-7 (Alcohol Calculator)
// Purpose: Verify mixed-drink ABV calculation and mocktail case.

import { calcTotalABV } from "../src/utils/abv";

describe("calcTotalABV()", () => {
  it("computes ABV for 50mL 40% spirit + 50mL water", () => {
    const abv = calcTotalABV([
      { volumeMl: 50, abvPercent: 40 },
      { volumeMl: 50, abvPercent: 0 },
    ]);
    expect(abv).toBe(20.0);
  });

  it("returns 0 for mocktail (all 0% components)", () => {
    const abv = calcTotalABV([
      { volumeMl: 30, abvPercent: 0 },
      { volumeMl: 120, abvPercent: 0 },
    ]);
    expect(abv).toBe(0);
  });
});
