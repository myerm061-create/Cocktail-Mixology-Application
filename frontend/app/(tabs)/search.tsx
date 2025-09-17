import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { searchByName, filterByIngredient, hydrateThumbs, Cocktail } from "../lib/cocktails";

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
          // fallback so you always see *something* during demos
          drinks = MOCK.filter(d => d.strDrink.toLowerCase().includes(trimmed.toLowerCase()));
        }

        drinks = await hydrateThumbs(drinks, 12);
        setResults(drinks);
      } catch (e: any) {
        setError(e?.message || "Something went wrong.");
        setResults(MOCK); // fallback in error case
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [trimmed]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Cocktails</Text>

      <TextInput
        placeholder="Type an ingredient (e.g., gin) or a drink (e.g., margarita)…"
        placeholderTextColor="#9A968A"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        style={styles.input}
      />

      <Pressable onPress={() => setQuery(q => q.trim())} style={styles.button} accessibilityRole="button">
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>

      {loading && <View style={{ marginTop: 12 }}><ActivityIndicator /></View>}
      {error && !loading && <Text style={styles.error}>Error: {error}</Text>}
      {!loading && !error && results.length === 0 && trimmed.length >= 2 && (
        <Text style={styles.empty}>No results. Try another ingredient or drink name.</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.idDrink}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.strDrinkThumb ? (
              <Image source={{ uri: item.strDrinkThumb }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <Text style={{ color: "#9A968A" }}>No Image</Text>
              </View>
            )}
            <Text style={styles.cardTitle}>{item.strDrink}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#101010" },
  title: { fontSize: 22, color: "#F5F0E1", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#3A3A3A", color: "#F5F0E1", padding: 12, borderRadius: 8 },
  button: { alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: "#3A3AA", borderRadius: 8, marginTop: 6 },
  buttonText: { color: "#F5F0E1" },
  error: { color: "#ff8a80", marginTop: 8 },
  empty: { color: "#D9D4C5", opacity: 0.8, marginTop: 8 },
  card: { borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: "#141414" },
  thumb: { width: "100%", height: 180, borderRadius: 8, marginBottom: 8, backgroundColor: "#222" },
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#F5F0E1", fontSize: 18, fontWeight: "600" },
});
