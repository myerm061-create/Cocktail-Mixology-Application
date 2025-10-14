import AsyncStorage from "@react-native-async-storage/async-storage";

export type Favorite = {
  id: string;              // TheCocktailDB id
  name: string;            // display name
  thumbUrl?: string | null;
  addedAt: number;         // for sorting
};

const KEY = "favorites:v1";

async function read(): Promise<Record<string, Favorite>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

async function write(map: Record<string, Favorite>) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function listFavorites(): Promise<Favorite[]> {
  const map = await read();
  return Object.values(map).sort((a, b) => b.addedAt - a.addedAt);
}

export async function isFavorite(id: string): Promise<boolean> {
  const map = await read();
  return !!map[id];
}

export async function addFavorite(item: Omit<Favorite, "addedAt">) {
  const map = await read();
  map[item.id] = { ...item, addedAt: Date.now() };
  await write(map);
}

export async function removeFavorite(id: string) {
  const map = await read();
  if (map[id]) {
    delete map[id];
    await write(map);
  }
}

/** Toggle and return the *new* state */
export async function toggleFavorite(item: Omit<Favorite, "addedAt">): Promise<boolean> {
  const map = await read();
  if (map[item.id]) {
    delete map[item.id];
    await write(map);
    return false;
  } else {
    map[item.id] = { ...item, addedAt: Date.now() };
    await write(map);
    return true;
  }
}
