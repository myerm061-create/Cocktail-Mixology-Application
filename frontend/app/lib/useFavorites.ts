import * as React from "react";
import {
  addFavorite,
  removeFavorite,
  listFavorites,
  isFavorite as isFavAPI,
  toggleFavorite,
  subscribe,
  type Favorite,
} from "./favorites";
import { useFocusEffect } from "expo-router";

export function useFavorites() {
  const [items, setItems] = React.useState<Favorite[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    try {
      const list = await listFavorites();
      setItems(list);
    } finally {
      setBusy(false);
    }
  }, []);

  // initial load
  React.useEffect(() => { void refresh(); }, [refresh]);

  // react to global favorites changes
  React.useEffect(() => {
    const off = subscribe(() => { void refresh(); });
    return off;
  }, [refresh]);

  // refresh when screen regains focus (e.g., after navigating back)
  useFocusEffect(
    React.useCallback(() => {
      void refresh();
      return () => {};
    }, [refresh])
  );

  const add = React.useCallback(async (f: Omit<Favorite, "addedAt">) => { await addFavorite(f); }, []);
  const remove = React.useCallback(async (id: string) => { await removeFavorite(id); }, []);
  const toggle = React.useCallback(async (f: Omit<Favorite, "addedAt">) => toggleFavorite(f), []);
  const isFavorite = React.useCallback((id: string) => isFavAPI(id), []);

  return { items, busy, refresh, add, remove, toggle, isFavorite };
}
