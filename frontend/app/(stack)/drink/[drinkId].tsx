// app/[drinkId].tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, UIManager } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DrinkDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { drinkId } = useLocalSearchParams<{ drinkId?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back button pinned near the top-left, respecting safe area */}
      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}>
        <BackButton />
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {/* Header / Title (you can swap this for the drink name later) */}
        <View style={[styles.headerWrap, { paddingTop: 56 }]}>
          <Text style={styles.title}>Drink Details</Text>
          {!!drinkId && <Text style={styles.subtitle}>ID: {drinkId}</Text>}
        </View>

        {/* Blank canvas area */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* TODO: Add hero image / thumbnail */}
          {/* TODO: Add basic info (name, category, glass, rating) */}
          {/* TODO: Add favorite toggle/button */}
          {/* TODO: Ingredients list */}
          {/* TODO: Instructions / Steps */}
          {/* TODO: Similar drinks / You may also like */}
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Your drink layout goes here.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backWrap: {
    position: "absolute",
    left: 14,
    zIndex: 10,
  },
  headerWrap: {
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary ?? "#9BA3AF",
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  placeholderBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder ?? "#2C2A35",
    backgroundColor: Colors.cardBackground ?? "#1A1921",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: Colors.textSecondary ?? "#9BA3AF",
  },
});
