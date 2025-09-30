import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, UIManager } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import type { CocktailItem } from "@/components/ui/CocktailGrid";
import CocktailGrid from "@/components/ui/CocktailGrid";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();

  // TODO: replace with your real favorites store
  const [items, setItems] = useState<CocktailItem[]>([
    { id: "11007", name: "Margarita",  thumbUrl: "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg" },
    { id: "11000", name: "Mojito",     thumbUrl: "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg" },
    { id: "11008", name: "Manhattan",  thumbUrl: "https://www.thecocktaildb.com/images/media/drink/yk70e31606771240.jpg" },
    { id: "17222", name: "Vodka Martini", thumbUrl: "https://www.thecocktaildb.com/images/media/drink/qyxrqw1439906528.jpg" },
    { id: "11009", name: "Moscow Mule", thumbUrl: "https://www.thecocktaildb.com/images/media/drink/3pylqc1504370988.jpg" },
  ]);

  const handleOpen = (id: string | number) => {
    // TODO: navigate to drink details screen here
    console.log("open drink", id);
  };

  const handleToggleFavorite = (id: string | number, next: boolean) => {
    // Since this is the Favorites screen, when next === false we remove it.
    if (!next) {
      setItems((prev) => prev.filter((d) => String(d.id) !== String(id)));
    }
    // If you want to support toggling back to true within the grid, you can update state instead.
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}>
        <BackButton />
      </View>

      <View style={[styles.headerWrap, { paddingTop: insets.top + 56 }]}>
        <Text style={styles.title}>Favorites</Text>
      </View>

      <CocktailGrid
        data={items}
        onPressItem={handleOpen}
        onToggleFavorite={handleToggleFavorite}
        bottomPad={140}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: Colors.background },
  backWrap: { position: "absolute", left: 14, zIndex: 10 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
});
