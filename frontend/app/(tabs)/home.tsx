import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import FormButton from "@/components/ui/FormButton";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top-right settings (cog) — same safe-area offset style as BackButton */}
      <Pressable
        onPress={() => router.push("/(stack)/settings")}
        accessibilityRole="button"
        accessibilityLabel="Open Settings"
        hitSlop={12}
        style={[styles.cogWrap, { top: Math.max(14, insets.top) }]}
      >
        <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
      </Pressable>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Home</Text>
        </View>

        {/* Navigation buttons */}
        {/* <FormButton title="Scan Ingredients" onPress={() => router.push("/(stack)/ingredient-scanner")} /> */}
        <FormButton title="My Cabinet" onPress={() => router.push("/cabinet")} />
        {/* <FormButton title="Recommendations" onPress={() => router.push("/(stack)/recommendations")} /> */}
        <FormButton title="Favorites" onPress={() => router.push("/favorites")} />
        <FormButton title="Profile" onPress={() => router.push("/profile")} />
        <FormButton title="Search" onPress={() => router.push("/search")} />
        <FormButton title="Assistant" onPress={() => router.push("/assistant")} />
        <FormButton title="Settings" onPress={() => router.push("/(stack)/settings")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 12 },
  headerWrap: { backgroundColor: Colors.background, alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  cogWrap: {
    position: "absolute",
    right: 14,
    zIndex: 10,
    padding: 8,
    borderRadius: 999,
  },
});
