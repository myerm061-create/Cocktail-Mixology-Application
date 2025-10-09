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
  Keyboard,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import type { Cocktail } from "../lib/cocktails";
import { searchByName, filterByIngredient, hydrateThumbs } from "../lib/cocktails";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mock data to show on first load and as fallback
const MOCK: Cocktail[] = [
  { idDrink: "m1", strDrink: "Margarita",     strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg" },
  { idDrink: "m2", strDrink: "Old Fashioned", strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/vrwquq1478252802.jpg" },
  { idDrink: "m3", strDrink: "Mojito",        strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cocktail[]>(MOCK); // show list right away
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const debounceMs = 350;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trimmed = useMemo(() => query.trim(), [query]);

  // FlatList ref to jump to top
  const listRef = useRef<FlatList<Cocktail>>(null);

  // Pagination
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const pagedResults = results.slice(0, page * PAGE_SIZE);

  // Reset to first page and jump to top whenever search text changes
  useEffect(() => {
    setPage(1);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [trimmed]);

  // Also jump to top when a new result set arrives (after API resolves)
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [results]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    // If query is short, show default list and stop loading state
    if (trimmed.length < 2) {
      setLoading(false);
      setError(null);
      setResults(MOCK);
      return;
    }

    timer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        Keyboard.dismiss(); // hide keyboard as search kicks off

        const words = trimmed.split(/\s+/);
        let drinks: Cocktail[] = [];

        if (words.length === 1) {
          drinks = await filterByIngredient(trimmed);
          if (!drinks.length) drinks = await searchByName(trimmed);
        } else {
          drinks = await searchByName(trimmed);
        }

        if (!drinks.length) {
          // fallback so you always see something
          drinks = MOCK.filter((d) =>
            d.strDrink.toLowerCase().includes(trimmed.toLowerCase())
          );
        }

        drinks = await hydrateThumbs(drinks, 12);
        setResults(drinks);
      } catch (e: any) {
        setError(e?.message || "Something went wrong.");
        setResults(MOCK); // fallback
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [trimmed]);

  const onPressSearch = () => setQuery((q) => q.trim());
  const canSearch = trimmed.length >= 2;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back button overlay */}
      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}>
        <BackButton />
      </View>

      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Header with title + search row */}
        <View style={[styles.headerWrap, { paddingTop: insets.top + 56 }]}>
          <Text style={styles.title}>Search</Text>

          {/* Search Input + Button */}
          <View style={styles.searchRow}>
            <TextInput
              placeholder="Type an ingredient or a drink…"
              placeholderTextColor="#9A968A"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={onPressSearch}
            />

            <Pressable
              onPress={onPressSearch}
              style={[styles.searchBtn, !canSearch && styles.searchBtnDisabled]}
              accessibilityRole="button"
              disabled={!canSearch}
            >
              <Text style={styles.searchBtnText}>Search</Text>
            </Pressable>
          </View>
        </View>

        {/* Results below header */}
        <View style={styles.resultsWrap}>
          {loading && <ActivityIndicator style={{ margin: 12 }} />}
          {error && !loading && <Text style={styles.error}>Error: {error}</Text>}
          {!loading && !error && results.length === 0 && trimmed.length >= 2 && (
            <Text style={styles.empty}>No results. Try another ingredient or drink name.</Text>
          )}

          <FlatList
            ref={listRef}
            data={pagedResults}
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
            ListFooterComponent={() =>
              pagedResults.length < results.length ? (
                <Pressable
                  onPress={() => setPage((p) => p + 1)}
                  style={{ padding: 16, alignItems: "center" }}
                >
                  <Text style={{ color: "#fff" }}>Load more</Text>
                </Pressable>
              ) : null
            }
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    color: "#F5F0E1",
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  searchBtn: {
    height: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 10,
    backgroundColor: "#1d1d1d",
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  searchBtnText: { color: "#F5F0E1", fontWeight: "700" },

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
