import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, UIManager } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Hide default header/back button */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back button in top-left */}
      <View style={styles.backWrap}>
        <BackButton />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56 }, // keep content below notch + back button
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title */}
        <Text style={styles.title}>Favorites</Text>

        {/* TODO: Add your favorite items list here */}
        <Text style={styles.placeholder}>
          Your saved cocktails will appear here.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  backWrap: { position: "absolute", top: 14, left: 14, zIndex: 10 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
});
