import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function Tab({ label, active, onPress }:{
  label: string; active?: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.tab, active ? s.active : s.idle]}>
      <Text style={[s.text, active && s.textActive]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  tab: { flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: 1, alignItems: "center" },
  idle: { backgroundColor: "#121216", borderColor: "#22222A" },
  active: { backgroundColor: "#1C1C22", borderColor: "#3A3A42" },
  text: { color: "#CFCFCF", fontWeight: "600", fontSize: 14 },
  textActive: { color: "#FFFFFF" },
});
