import { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    setLoading(true);
    try {
      const mock = [
        { id: "1", name: "Margarita" },
        { id: "2", name: "Old Fashioned" },
        { id: "3", name: "Mojito" },
      ].filter(x => x.name.toLowerCase().includes(query.toLowerCase()));
      setResults(mock);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Cocktails</Text>

      <TextInput
        placeholder="Type an ingredient or drink name…"
        placeholderTextColor="#9A968A"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        style={styles.input}
      />

      <Pressable onPress={onSearch} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? "Searching…" : "Search"}</Text>
      </Pressable>

      {(!loading && results.length === 0 && query.length > 0) && (
        <Text style={styles.empty}>No results. Try another ingredient.</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8 }}
        renderItem={({ item }) => (
          <Text style={styles.result}>{item.name}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#101010" },
  title: { fontSize: 22, color: "#F5F0E1", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#3A3A3A",
    color: "#F5F0E1",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 8,
  },
  buttonText: { color: "#F5F0E1" },
  empty: { color: "#D9D4C5", opacity: 0.8, marginTop: 8 },
  result: { color: "#F5F0E1", fontSize: 18, paddingVertical: 6 },
});
