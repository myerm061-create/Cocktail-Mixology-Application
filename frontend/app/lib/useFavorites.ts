import * as React from "react";
import { addFavorite, removeFavorite, listFavorites, isFavorite as isFavAPI, toggleFavorite, type Favorite } from "./favorites";

export function useFavorites() {
  const [items, setItems] = React.useState<Favorite[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    try { setItems(await listFavorites()); }
    finally { setBusy(false); }
  }, []);

  React.useEffect(() => { void refresh(); }, [refresh]);

  const add = React.useCallback(async (f: Omit<Favorite, "addedAt">) => {
    await addFavorite(f);
    await refresh();
  }, [refresh]);

  const remove = React.useCallback(async (id: string) => {
    await removeFavorite(id);
    await refresh();
  }, [refresh]);

  const toggle = React.useCallback(async (f: Omit<Favorite, "addedAt">) => {
    const now = await toggleFavorite(f);
    await refresh();
    return now;
  }, [refresh]);

  const isFavorite = React.useCallback((id: string) => isFavAPI(id), []);

  return { items, busy, refresh, add, remove, toggle, isFavorite };
}
