import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  UIManager,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import { searchByName, filterByIngredient, hydrateThumbs, Cocktail } from "../lib/cocktails";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MOCK: Cocktail[] = [
  { idDrink: "m1", strDrink: "Margarita", strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg" },
  { idDrink: "m2", strDrink: "Old Fashioned", strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/vrwquq1478252802.jpg" },
  { idDrink: "m3", strDrink: "Mojito", strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const debounceMs = 350;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    timer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const words = trimmed.split(/\s+/);
        let drinks: Cocktail[] = [];

        if (words.length === 1) {
          drinks = await filterByIngredient(trimmed);
          if (!drinks.length) drinks = await searchByName(trimmed);
        } else {
          drinks = await searchByName(trimmed);
        }

        if (!drinks.length) {
          drinks = MOCK.filter((d) =>
            d.strDrink.toLowerCase().includes(trimmed.toLowerCase())
          );
        }

        drinks = await hydrateThumbs(drinks, 12);
        setResults(drinks);
      } catch (e: any) {
        setError(e?.message || "Something went wrong.");
        setResults(MOCK);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [trimmed]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back button overlay */}
      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}>
        <BackButton />
      </View>

      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Fixed header with title + search bar */}
        <View style={[styles.headerWrap, { paddingTop: insets.top + 56 }]}>
          <Text style={styles.title}>Search</Text>

          <TextInput
            placeholder="Type an ingredient or a drink…"
            placeholderTextColor="#9A968A"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable
            onPress={() => setQuery((q) => q.trim())}
            style={styles.button}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Search</Text>
          </Pressable>
        </View>

        {/* Results list below header */}
        <View style={styles.resultsWrap}>
          {loading && <ActivityIndicator style={{ margin: 12 }} />}
          {error && !loading && <Text style={styles.error}>Error: {error}</Text>}
          {!loading && !error && results.length === 0 && trimmed.length >= 2 && (
            <Text style={styles.empty}>No results. Try another ingredient or drink name.</Text>
          )}

          <FlatList
            data={results}
            keyExtractor={(item) => item.idDrink}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {item.strDrinkThumb ? (
                  <Image
                    source={{ uri: item.strDrinkThumb }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.thumb, styles.thumbFallback]}>
                    <Text style={{ color: "#9A968A" }}>No Image</Text>
                  </View>
                )}
                <Text style={styles.cardTitle}>{item.strDrink}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101010" },
  headerWrap: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backWrap: { position: "absolute", left: 14, zIndex: 10 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3A3A3A",
    color: "#F5F0E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 8,
  },
  buttonText: { color: "#F5F0E1" },
  resultsWrap: { flex: 1, padding: 16 },
  error: { color: "#ff8a80", marginTop: 8 },
  empty: { color: "#D9D4C5", opacity: 0.8, marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#141414",
  },
  thumb: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#222",
  },
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#F5F0E1", fontSize: 18, fontWeight: "600" },
});
