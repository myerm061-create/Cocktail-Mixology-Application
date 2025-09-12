import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function Chip({
  label,
  active,
  onPress,
}: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active ? s.active : s.idle]}>
      <Text style={[s.text, active && s.textActive]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  idle: { backgroundColor: "transparent", borderColor: "#2A2A30" },
  active: { backgroundColor: "#1F1F24", borderColor: "#3A3A42" },
  text: { fontSize: 13, color: "#CFCFCF", maxWidth: 120 },
  textActive: { color: "#FFFFFF", fontWeight: "600" },
});
