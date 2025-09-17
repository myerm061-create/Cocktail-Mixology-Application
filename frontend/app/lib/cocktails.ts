export type Cocktail = {
  idDrink: string;
  strDrink: string;
  strDrinkThumb?: string | null;
};

// normalize { drinks: null } -> []
function safeDrinks(data: any): Cocktail[] {
  if (!data || !Array.isArray(data.drinks)) return [];
  return data.drinks as Cocktail[];
}

export async function searchByName(q: string): Promise<Cocktail[]> {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return safeDrinks(await res.json());
}

export async function filterByIngredient(ingredient: string): Promise<Cocktail[]> {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return safeDrinks(await res.json());
}

export async function getDetailsById(id: string): Promise<Cocktail | null> {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const drinks = safeDrinks(await res.json());
  return drinks.length ? drinks[0] : null;
}

export async function hydrateThumbs(drinks: Cocktail[], limit = 12): Promise<Cocktail[]> {
  const needs = drinks.filter(d => !d?.strDrinkThumb).slice(0, limit);
  if (!needs.length) return drinks;
  const lookups = await Promise.all(needs.map(d => getDetailsById(d.idDrink).catch(() => null)));
  const byId = new Map(lookups.filter(Boolean).map(d => [d!.idDrink, d!]));
  return drinks.map(d => {
    const full = byId.get(d.idDrink);
    return full ? { ...d, strDrinkThumb: full.strDrinkThumb ?? d.strDrinkThumb, strDrink: full.strDrink ?? d.strDrink } : d;
  });
}
