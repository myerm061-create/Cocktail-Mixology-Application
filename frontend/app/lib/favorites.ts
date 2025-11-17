import AsyncStorage from '@react-native-async-storage/async-storage';

export type Favorite = {
  id: string;
  name: string;
  thumbUrl?: string | null;
  addedAt: number;
};

const KEY = 'favorites:v1';

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* noop */
    }
  });
}
export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function read(): Promise<Record<string, Favorite>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

async function write(map: Record<string, Favorite>) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
  emit();
}

export async function listFavorites(): Promise<Favorite[]> {
  const map = await read();
  return Object.values(map).sort((a, b) => b.addedAt - a.addedAt);
}

export async function isFavorite(id: string): Promise<boolean> {
  const map = await read();
  return !!map[id];
}

export async function addFavorite(item: Omit<Favorite, 'addedAt'>) {
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

/** Toggle and return the *new* state (true if now favorited) */
export async function toggleFavorite(
  item: Omit<Favorite, 'addedAt'>,
): Promise<boolean> {
  const map = await read();
  const exists = !!map[item.id];
  if (exists) {
    delete map[item.id];
  } else {
    map[item.id] = { ...item, addedAt: Date.now() };
  }
  await write(map);
  return !exists;
}
