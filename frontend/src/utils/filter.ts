export type Recipe = {
  id?: string;
  name: string;
  ingredients: string[]; // e.g., ["Vodka", "Lime Juice", "Simple Syrup"]
};

const norm = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ");

/** returns true if every recipe ingredient exists in the available list (case-insensitive) */
export const canMake = (recipe: Recipe, available: string[]): boolean => {
  const have = new Set(available.map(norm));
  return recipe.ingredients.every(ing => have.has(norm(ing)));
};

/** returns true if you're missing exactly one ingredient */
export const needsOneMore = (recipe: Recipe, available: string[]): boolean => {
  const have = new Set(available.map(norm));
  const missing = recipe.ingredients.filter(ing => !have.has(norm(ing)));
  return missing.length === 1;
};

/** filter out recipes that contain any excluded ingredients */
export const excludeBy = (recipes: Recipe[], exclusions: string[]): Recipe[] => {
  if (!exclusions.length) return recipes;
  const ban = new Set(exclusions.map(norm));
  return recipes.filter(r =>
    r.ingredients.every(ing => !ban.has(norm(ing)))
  );
};
