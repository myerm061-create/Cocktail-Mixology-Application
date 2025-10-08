import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, UIManager, Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Drink = {
  idDrink: string;
  strDrink: string;
  strDrinkThumb?: string | null;
  // add the fields we need later (category, glass, instructions, etc.)
};

export default function DrinkDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { drinkId, name, thumbUrl } =
    useLocalSearchParams<{ drinkId?: string; name?: string; thumbUrl?: string }>();

  const [isFav, setIsFav] = React.useState(false);
  const [drink, setDrink] = React.useState<Drink | null>(null);

  // Fetch by ID when we have it
  React.useEffect(() => {
    if (!drinkId) return;
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`)
      .then(r => r.json())
      .then(j => setDrink(j?.drinks?.[0] ?? null))
      .catch(() => {});
  }, [drinkId]);

  // Instant UI from params; auto-updates when fetch returns
  const title = drink?.strDrink || name || "Drink Details";
  const heroSrc = drink?.strDrinkThumb || thumbUrl || "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}>
        <BackButton />
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={[styles.headerWrap, { paddingTop: 56 }]}>
          <Text style={styles.title}>{title}</Text>
          {!!drinkId && <Text style={styles.subtitle}>ID: {drinkId}</Text>}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* HERO */}
          <View style={styles.heroCard}>
            <Image source={{ uri: heroSrc }} style={styles.heroImage} contentFit="cover" transition={100} />
            <Pressable onPress={() => setIsFav(v => !v)} hitSlop={12} style={styles.heartBtn}>
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? ("#FF6B6B") : Colors.textPrimary} />
            </Pressable>
            <View style={styles.heroTitlePill}>
              <Text numberOfLines={1} style={styles.heroTitleText}>{title}</Text>
            </View>
          </View>

          {/* TODO: render fields from `drink` here (category, glass, ingredients, instructions) */}
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Ingredients, steps, etc. go here.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backWrap: { position: "absolute", left: 14, zIndex: 10 },
  headerWrap: { backgroundColor: Colors.background, alignItems: "center", paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary },
  subtitle: { marginTop: 6, fontSize: 12, color: Colors.textSecondary ?? "#9BA3AF" },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 140 },

  heroCard: { marginTop: 8, borderRadius: RADIUS, overflow: "hidden", position: "relative", backgroundColor: Colors.cardBackground ?? "#1A1921" },
  heroImage: { width: "100%", aspectRatio: 4 / 5, borderRadius: RADIUS },
  heartBtn: { position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" },
  heroTitlePill: { position: "absolute", bottom: 10, left: 10, right: 10, alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.45)" },
  heroTitleText: { fontSize: 22, fontWeight: "800", color: "#fff", textAlign: "center" },

  placeholderBox: { marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder ?? "#2C2A35", backgroundColor: Colors.buttonBackground, padding: 20, alignItems: "center", justifyContent: "center" },
  placeholderText: { color: Colors.textSecondary ?? "#9BA3AF" },
});
