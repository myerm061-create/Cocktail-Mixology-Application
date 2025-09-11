import React from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";

export default function SearchBar({
  value,
  onChangeText,
  onClear,
}: { value: string; onChangeText: (t: string) => void; onClear: () => void; }) {
  return (
    <View style={s.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search ingredients…"
        placeholderTextColor="#8B8B8B"
        style={s.input}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={s.clear}>
          <Text style={s.clearText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 8, paddingHorizontal: 20, position: "relative" },
  input: {
    height: 44, borderRadius: 12, paddingHorizontal: 14,
    backgroundColor: "#1A1A1E", color: "#EAEAEA", borderWidth: 1, borderColor: "#232329",
  },
  clear: { position: "absolute", right: 28, top: 10, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  clearText: { color: "#A9A9A9", fontSize: 20, lineHeight: 20 },
});
