import { canMake, needsOneMore, excludeBy } from "../src/utils/filter";

type Recipe = {
  id?: string;
  name: string;
  ingredients: string[];
};

const gimlet: Recipe = {
  name: "Gimlet",
  ingredients: ["Gin", "Lime Juice", "Simple Syrup"],
};
const margarita: Recipe = {
  name: "Margarita",
  ingredients: ["Tequila", "Lime Juice", "Triple Sec"],
};
const whiskeySour: Recipe = {
  name: "Whiskey Sour",
  ingredients: ["Whiskey", "Lemon Juice", "Simple Syrup", "Egg White"],
};

describe("ingredient filtering utilities", () => {
  test("canMake is case/space insensitive", () => {
    const have = [" gin ", "lime  juice", "SIMPLE syrup"];
    expect(canMake(gimlet, have)).toBe(true);
  });

  test("needsOneMore detects exactly one missing ingredient", () => {
    const have = ["Tequila", "Lime Juice"]; // missing Triple Sec
    expect(needsOneMore(margarita, have)).toBe(true);
    expect(canMake(margarita, have)).toBe(false);
  });

  test("excludeBy removes recipes containing banned ingredients", () => {
    const all = [gimlet, margarita, whiskeySour];
    const noEgg = excludeBy(all, ["egg white"]);
    expect(noEgg.find(r => r.name === "Whiskey Sour")).toBeUndefined();
    expect(noEgg.map(r => r.name).sort()).toEqual(["Gimlet", "Margarita"].sort());
  });
});
