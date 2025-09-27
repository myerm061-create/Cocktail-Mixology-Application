import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  UIManager,
  Image,
  Pressable,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Drink details screen
export default function DrinkDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { drinkId, name, thumbUrl } =
    useLocalSearchParams<{ drinkId?: string; name?: string; thumbUrl?: string }>();

  const [isFav, setIsFav] = React.useState(false);

  // Temporary fallbacks until we wire data
  const title = name || "Drink Details";
  const heroSrc =
    thumbUrl ||
    "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back button pinned near the top-left, respecting safe area */}
      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}>
        <BackButton />
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.headerWrap, { paddingTop: 56 }]}>
          <Text style={styles.title}>{title}</Text>
          {!!drinkId && <Text style={styles.subtitle}>ID: {drinkId}</Text>}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* HERO CARD */}
          <View style={styles.heroCard}>
            <Image source={{ uri: heroSrc }} style={styles.heroImage} resizeMode="cover" />
            {/* Heart overlay */}
            <Pressable
              onPress={() => setIsFav((v) => !v)}
              hitSlop={12}
              style={styles.heartBtn}
              android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={22}
                color={isFav ? (Colors.accentHeart ) : Colors.textPrimary}
              />
            </Pressable>

            {/* Title over image */}
            <View style={styles.heroTitlePill}>
              <Text numberOfLines={1} style={styles.heroTitleText}>
                {title}
              </Text>
            </View>
          </View>

          {/* Blank canvas below for later sections */}
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Ingredients, steps, etc. go here.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backWrap: { position: "absolute", left: 14, zIndex: 10 },
  headerWrap: { backgroundColor: Colors.background, alignItems: "center", paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary },
  subtitle: { marginTop: 6, fontSize: 12, color: Colors.textSecondary },

  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 140 },

  heroCard: {
    marginTop: 8,
    borderRadius: RADIUS,
    overflow: "hidden",
    position: "relative",
    // keep it inset from screen edges
    backgroundColor: Colors.cardBackground,
  },
  heroImage: {
    width: "100%",
    aspectRatio: 4 / 5, // taller card look; tweak as you like
    borderRadius: RADIUS,
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroTitlePill: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroTitleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowRadius: 6,
  },

  placeholderBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBackground,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: Colors.textSecondary },
});
