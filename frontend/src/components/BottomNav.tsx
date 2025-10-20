// src/components/BottomNav.tsx
// Linked Requirement: FR-21 (Navigation Core)
// A lightweight bottom navigation bar with 5 icons.

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type NavItem = {
  label: string;
  onPress: () => void;
};

type Props = {
  items?: NavItem[];
};

export default function BottomNav({ items }: Props) {
  const navItems =
    items ||
    [
      "Home",
      "Create",
      "Search",
      "Profile",
      "Favorites",
    ].map((label) => ({ label, onPress: () => {} }));

  return (
    <View style={styles.bar}>
      {navItems.map((item) => (
        <TouchableOpacity key={item.label} onPress={item.onPress} testID={`nav-${item.label}`}>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    paddingVertical: 12,
  },
  label: {
    color: "white",
    fontSize: 14,
  },
});
