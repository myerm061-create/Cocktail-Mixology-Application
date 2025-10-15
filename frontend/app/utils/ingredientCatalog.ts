import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@mixology:cocktaildb:ingredient_catalog_v1";

type CatalogItem = { name: string }; // keep simple

function parseCatalog(drinks: any[]): CatalogItem[] {
  // API returns shape: { drinks: [{ strIngredient1: "Gin" }, ...] }
  return (drinks ?? [])
    .map((d) => String(d?.strIngredient1 || "").trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

export async function loadIngredientCatalog(): Promise<CatalogItem[]> {
  // try cache first
  const cached = await AsyncStorage.getItem(KEY);
  if (cached) {
    try { return JSON.parse(cached) as CatalogItem[]; } catch {}
  }

  // fetch from CocktailDB
  const res = await fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list");
  const data = await res.json().catch(() => ({ drinks: [] }));
  const list = parseCatalog(data.drinks);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return list;
}