import React, { useRef, useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, type Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Image as ExpoImage } from "expo-image";
import { fallbackIngredientImageUrls } from "../../app/utils/cocktaildb";
import SwipeAction from "./SwipeAction";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

export type Category = "Spirit" | "Liqueur" | "Mixer" | "Juice" | "Garnish" | "Other";
export type Ingredient = {
  id: string;
  name: string;
  category: Category;
  owned: boolean;
  wanted?: boolean;
  impactScore?: number;
  imageUrl?: string;
  /** 0..1 fraction remaining. default 1 (full). */
  qty?: number;
};

export default function CabinetRow({
  item,
  onToggleMenu,
  onAddToShopping,
  onRemoveFromCabinet,
}: {
  item: Ingredient;
  onToggleMenu: (id: string) => void;
  onAddToShopping: (id: string) => void;
  onRemoveFromCabinet: (id: string) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);

  // Build candidates: custom → CocktailDB fallbacks, de-duped
  const candidates = useMemo<string[]>(() => {
    const list = [
      ...(item.imageUrl ? [item.imageUrl] : []),
      ...fallbackIngredientImageUrls(item.name),
    ];
    return Array.from(new Set(list));
  }, [item.imageUrl, item.name]);

  const currentSrc = candidates[Math.min(idx, Math.max(0, candidates.length - 1))];
  // bust cache between attempts so a cached 404 doesn’t stick on web
  const bustedSrc = currentSrc ? `${currentSrc}${currentSrc.includes("?") ? "&" : "?"}try=${idx}` : undefined;

  // Reset when the row changes
  useEffect(() => {
    setIdx(0);
    setAllFailed(false);
  }, [item.id, item.name, item.imageUrl]);

  // Spinner whenever the candidate changes
  useEffect(() => {
    if (!allFailed) setLoading(true);
  }, [bustedSrc, allFailed]);

  const handleOpen = (direction: "left" | "right") => {
    if (direction === "left") onAddToShopping(item.id);
    else onRemoveFromCabinet(item.id);
    requestAnimationFrame(() => swipeRef.current?.close());
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => (
    <SwipeAction progress={progress} icon="🛒" label="Add" backgroundColor="#1E8449" alignLeft />
  );
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => (
    <SwipeAction progress={progress} icon="🗑️" label="Remove" backgroundColor="#C0392B" />
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      onSwipeableOpen={handleOpen}
      childrenContainerStyle={{ overflow: "visible" }}
    >
      <View style={styles.rowWrap}>
        <View style={styles.rowCard}>
          <View style={styles.imageContainer}>
            {allFailed ? (
              // Local monogram fallback – no network
              <View style={styles.monogram}>
                <Text style={styles.monogramText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
            ) : (
              <>
                <ExpoImage
                  key={bustedSrc}     // force remount when idx changes
                  source={{ uri: bustedSrc! }}
                  style={styles.ingredientImage}
                  contentFit="cover"
                  // avoid persisting 404s in cache on web
                  cachePolicy="none"
                  transition={100}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    // move to next candidate or give up
                    if (idx < candidates.length - 1) {
                      setLoading(false);
                      setIdx(i => i + 1);
                    } else {
                      setLoading(false);
                      setAllFailed(true);
                    }
                  }}
                />
                {loading && (
                  <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="small" color="#9C9CA3" />
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.rowSub} numberOfLines={1}>{item.category}</Text>
          </View>

          <Pressable onPress={() => onToggleMenu(item.id)} accessibilityLabel="More actions" style={styles.menuButton}>
            <Text style={styles.menuDots}>⋯</Text>
          </Pressable>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rowWrap: { position: "relative", marginHorizontal: 6, marginVertical: 4, overflow: "visible" },
  rowCard: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 10,
    backgroundColor: Colors.buttonBackground, borderWidth: 1, borderColor: "#232329",
    borderRadius: 14, overflow: "visible",
  },
  imageContainer: {
    width: 40, height: 40, marginRight: 12, borderRadius: 8, overflow: "hidden",
    backgroundColor: "#2A2A30", alignItems: "center", justifyContent: "center",
  },
  ingredientImage: { width: "100%", height: "100%" },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
  monogram: {
    width: "100%", height: "100%",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#3A3A40",
  },
  monogramText: { color: "#CFCFCF", fontWeight: "700" },
  rowTextWrap: { flex: 1, marginRight: 8, overflow: "hidden" },
  rowTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "600" },
  rowSub: { color: Colors.textSecondary ?? "#9BA3AF", fontSize: 12, marginTop: 2 },
  menuButton: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: "#2A2A30",
    alignItems: "center", justifyContent: "center", backgroundColor: "#1A1A1E", marginLeft: 8, zIndex: 5,
  },
  menuDots: { color: "#CFCFCF", fontSize: 18, lineHeight: 18, marginTop: -2, fontWeight: "800" },
});
