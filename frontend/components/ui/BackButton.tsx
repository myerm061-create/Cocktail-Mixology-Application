import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

// A back button component to navigate to the previous screen
export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,   // adjust based on status bar
    left: 20,
    zIndex: 10,
    padding: 8,
  },
});