// app/(tabs)/favorites.tsx
import React from "react";
import { View, Text, StyleSheet, Platform, UIManager } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import CocktailGrid, { type CocktailItem } from "@/components/ui/CocktailGrid";
import { useFavorites } from "@/app/lib/useFavorites";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { items, busy, toggle } = useFavorites(); // persisted via AsyncStorage

  const data: CocktailItem[] = (items ?? []).map(f => ({
    id: f.id,
    name: f.name,
    thumbUrl: f.thumbUrl ?? null,
    isFavorite: true,
  }));

  const handleOpen = (id: string | number) => {
    const it = data.find(d => String(d.id) === String(id));
    if (!it) return;
    router.push({
      pathname: "/drink/[drinkId]",
      params: { drinkId: String(it.id), name: it.name, thumbUrl: it.thumbUrl ?? undefined },
    });
  };

  const handleToggleFavorite = (id: string | number, _next: boolean) => {
    const it = data.find(d => String(d.id) === String(id));
    if (!it) return;
    void toggle({ id: String(it.id), name: it.name, thumbUrl: it.thumbUrl ?? null });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}><BackButton /></View>

      <View style={[styles.headerWrap, { paddingTop: insets.top + 56 }]}>
        <Text style={styles.title}>Favorites</Text>
        {busy ? <Text style={styles.subtle}>Syncing…</Text> : null}
        {data.length === 0 && <Text style={styles.empty}>No favorites yet. Add from Search or the Drink page </Text>}
      </View>

      <CocktailGrid
        data={data}
        onPressItem={handleOpen}
        onToggleFavorite={handleToggleFavorite}
        bottomPad={140}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: Colors.background, alignItems: "center" },
  backWrap: { position: "absolute", left: 14, zIndex: 10 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 4 },
  subtle: { color: Colors.textSecondary ?? "#9BA3AF", fontSize: 12, marginBottom: 8 },
  empty: { color: Colors.textSecondary ?? "#9BA3AF", fontSize: 13, marginTop: 6 },
});
