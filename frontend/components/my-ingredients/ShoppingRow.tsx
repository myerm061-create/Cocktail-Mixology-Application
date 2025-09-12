import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Category } from "./CabinetRow";

export type Ingredient = { id: string; name: string; category: Category; owned: boolean; wanted?: boolean };

export default function ShoppingRow({
  item,
  onToggleMenu,
  onToggleWanted,
}: {
  item: Ingredient;
  onToggleMenu: (id: string) => void;
  onToggleWanted: (id: string) => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onToggleWanted(item.id)}
        style={[styles.checkbox, item.wanted && styles.checkboxChecked]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!item.wanted }}
      >
        {item.wanted ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </Pressable>

      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>{item.category}</Text>
      </View>

      <Pressable onPress={() => onToggleMenu(item.id)} accessibilityLabel="More actions" style={styles.menuButton}>
        <Text style={styles.menuDots}>⋯</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 10,
    marginHorizontal: 6, marginVertical: 4,
    backgroundColor: "#141419", borderWidth: 1, borderColor: "#232329", borderRadius: 14,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#3C3C46",
    alignItems: "center", justifyContent: "center", backgroundColor: "transparent", marginRight: 12,
  },
  checkboxChecked: { backgroundColor: "#3B7BFF", borderColor: "#3B7BFF" },
  checkboxMark: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  rowTextWrap: { flex: 1, marginRight: 8, overflow: "hidden" },
  rowTitle: { color: "#EDEDED", fontSize: 16, fontWeight: "600" },
  rowSub: { color: "#9C9CA3", fontSize: 12, marginTop: 2 },
  menuButton: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: "#2A2A30",
    alignItems: "center", justifyContent: "center", backgroundColor: "#1A1A1E", marginLeft: 8, zIndex: 5,
  },
  menuDots: { color: "#CFCFCF", fontSize: 18, lineHeight: 18, marginTop: -2, fontWeight: "800" },
});
