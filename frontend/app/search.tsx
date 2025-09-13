// app/search.tsx
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TextInput, View, Pressable } from "react-native";

// Temporary test data
type UICocktail = {
  id: string;
  name: string;
  thumb?: string | null;
  glass?: string | null;
  alcoholic?: string | null;
};
// temporary access to the database untill backend programmed
const MOCK: UICocktail[] = [
  { id: "11007", name: "Margarita", thumb: "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg", glass: "Cocktail glass", alcoholic: "Alcoholic" },
  { id: "11000", name: "Mojito",    thumb: "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg", glass: "Highball glass", alcoholic: "Alcoholic" },
  { id: "17222", name: "Aviation",  thumb: "https://www.thecocktaildb.com/images/media/drink/trbplb1606855233.jpg", glass: "Cocktail glass", alcoholic: "Alcoholic" },
  { id: "178366", name: "Non-Alcoholic Mojito", thumb: "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg", glass: "Highball glass", alcoholic: "Non alcoholic" },
];

// ssetup of search states
export default function SearchScreen() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UICocktail[]>([]);
  const [error, setError] = useState<string | null>(null);

  // simple "debounce" helper so we don't search on every keystroke
  const debounce = useMemo(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (fn: () => void, ms = 350) => {
      if (t) clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }, []);

  useEffect(() => {
    // reset on empty
    if (!q.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // simulate network latency + filtering MOCK data
    debounce(() => {
      try {
        const term = q.trim().toLowerCase();
        const filtered = MOCK.filter(
          d =>
            d.name.toLowerCase().includes(term) ||
            (d.alcoholic ?? "").toLowerCase().includes(term) ||
            (d.glass ?? "").toLowerCase().includes(term)
        );
        setResults(filtered);
      } catch (e) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [q, debounce]);
//will need to update all style choices
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Search Cocktails</Text>

      <TextInput
        placeholder="Try: margarita, mojito…"
        autoCapitalize="none"
        value={q}
        onChangeText={setQ}
        style={{
          borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 12,
          fontSize: 18, backgroundColor: "white"
        }}
        accessibilityLabel="Search input"
        accessibilityHint="Type a cocktail name or keyword"
      />

      {loading && (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator />
        </View>
      )}

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {}}
            style={{
              flexDirection: "row", alignItems: "center", gap: 12,
              backgroundColor: "white", padding: 12, borderRadius: 16,
              // light shadow/elevation
              shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
              elevation: 1
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}
          >
            {item.thumb ? (
              <Image source={{ uri: item.thumb }} style={{ width: 64, height: 64, borderRadius: 12 }} />
            ) : (
              <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: "#eee" }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "600" }}>{item.name}</Text>
              <Text style={{ color: "#555" }}>
                {(item.alcoholic ?? "—")} • {(item.glass ?? "")}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading && q ? (
            <Text style={{ marginTop: 12 }}>No results for “{q}”.</Text>
          ) : null
        }
      />

      {/* Tiny helper text so reviewers know it’s still mock data */}
      <Text style={{ color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }}>
        Mock data only. API wiring comes next.
      </Text>
    </View>
  );
}
