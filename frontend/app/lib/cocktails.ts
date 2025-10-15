export type Cocktail = {
  idDrink: string;
  strDrink: string;
  strDrinkThumb?: string | null;
};

// Full details for a single drink screen
export type CocktailDetails = Cocktail & {
  strInstructions?: string | null;
  strCategory?: string | null;
  ingredients?: { ingredient: string; measure?: string }[];
};

// normalize { drinks: null } -> []
function safeDrinks(data: any): any[] {
  if (!data || !Array.isArray(data.drinks)) return [];
  return data.drinks as any[];
}

// helper: build ingredients/measures array from TheCocktailDB shape
function parseIngredients(drink: any): { ingredient: string; measure?: string }[] {
  const out: { ingredient: string; measure?: string }[] = [];
  for (let i = 1; i <= 15; i++) {
    const ing = (drink?.[`strIngredient${i}`] ?? "").trim?.() ?? "";
    const mea = (drink?.[`strMeasure${i}`] ?? "").trim?.() ?? "";
    if (!ing) continue;
    out.push({ ingredient: ing, measure: mea || undefined });
  }
  return out;
}

// map raw drink to summary Cocktail
function toSummary(drink: any): Cocktail {
  return {
    idDrink: String(drink.idDrink),
    strDrink: String(drink.strDrink),
    strDrinkThumb: drink.strDrinkThumb ?? null,
  };
}

// map raw drink to detailed CocktailDetails
function toDetails(drink: any): CocktailDetails {
  return {
    ...toSummary(drink),
    strInstructions: drink.strInstructions ?? null,
    strCategory: drink.strCategory ?? null,
    ingredients: parseIngredients(drink),
  };
}

// --- robust fetch helpers ---

async function fetchJsonSafe(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch { /* ignore */ }
    throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ""}`);
  }

  let text = "";
  try { text = await res.text(); } catch { /* ignore */ }

  if (!text) return { drinks: [] };

  try {
    return JSON.parse(text);
  } catch {
    return { drinks: [] };
  }
}

export async function searchByName(q: string): Promise<Cocktail[]> {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`;
  const data = await fetchJsonSafe(url);
  const drinks = safeDrinks(data);
  return drinks.map(toSummary);
}

export async function filterByIngredient(ingredient: string): Promise<Cocktail[]> {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
  const data = await fetchJsonSafe(url);
  const drinks = safeDrinks(data);
  return drinks.map(toSummary);
}

export async function getDetailsById(id: string): Promise<CocktailDetails | null> {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;
  const data = await fetchJsonSafe(url);
  const drinks = safeDrinks(data);
  return drinks.length ? toDetails(drinks[0]) : null;
}

// Fill in missing thumbs for a list
export async function hydrateThumbs(drinks: Cocktail[], limit = 12): Promise<Cocktail[]> {
  const needs = drinks.filter((d) => !d?.strDrinkThumb).slice(0, limit);
  if (!needs.length) return drinks;

  const lookups = await Promise.all(
    needs.map((d) => getDetailsById(d.idDrink).catch(() => null))
  );

  const byId = new Map(lookups.filter(Boolean).map((d) => [d!.idDrink, d!]));
  return drinks.map((d) => {
    const full = byId.get(d.idDrink);
    return full
      ? {
          ...d,
          strDrinkThumb: full.strDrinkThumb ?? d.strDrinkThumb,
          strDrink: full.strDrink ?? d.strDrink,
        }
      : d;
  });
}
