import React, { useRef, useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator, Animated } from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import unsplashService from "@/services/unsplashService";
import SwipeAction from "./SwipeAction";

export type Category = "Spirit" | "Liqueur" | "Mixer" | "Juice" | "Garnish" | "Other";
export type Ingredient = { id: string; name: string; category: Category; owned: boolean; wanted?: boolean; impactScore?: number; imageUrl?: string };

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
  const [imageUrl, setImageUrl] = useState<string | null>(item.imageUrl || null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const loadImage = useCallback(async () => {
      setIsLoadingImage(true);
      try {
        const url = await unsplashService.getIngredientImage(item.name);
        if (url) setImageUrl(url);
      } catch (error) {
        console.warn(`Failed to load image for ${item.name}:`, error);
      } finally {
        setIsLoadingImage(false);
      }
    }, [item.name]);

  useEffect(() => {
    if (!imageUrl && !isLoadingImage) {
      void loadImage(); 
    }
  }, [imageUrl, isLoadingImage, loadImage]);

  const handleOpen = (direction: "left" | "right") => {
    if (direction === "left") onAddToShopping(item.id);
    else if (direction === "right") onRemoveFromCabinet(item.id);
    requestAnimationFrame(() => swipeRef.current?.close());
  };

  // Super simple actions using reusable component
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => (
    <SwipeAction 
      progress={progress} 
      icon="🛒" 
      label="Add" 
      backgroundColor="#1E8449" 
      alignLeft 
    />
  );

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => (
    <SwipeAction 
      progress={progress} 
      icon="🗑️" 
      label="Remove" 
      backgroundColor="#C0392B" 
    />
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
            {isLoadingImage ? (
              <ActivityIndicator size="small" color="#9C9CA3" />
            ) : imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.ingredientImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{item.name.charAt(0)}</Text>
              </View>
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
    flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10,
    backgroundColor: "#141419", borderWidth: 1, borderColor: "#232329", borderRadius: 14, overflow: "visible",
  },
  imageContainer: {
    width: 40, height: 40, marginRight: 12, borderRadius: 8, overflow: "hidden",
    backgroundColor: "#2A2A30", alignItems: "center", justifyContent: "center",
  },
  ingredientImage: {
    width: "100%", height: "100%", resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%", height: "100%", backgroundColor: "#3A3A40", 
    alignItems: "center", justifyContent: "center",
  },
  placeholderText: {
    color: "#9C9CA3", fontSize: 16, fontWeight: "600",
  },
  rowTextWrap: { flex: 1, marginRight: 8, overflow: "hidden" },
  rowTitle: { color: "#EDEDED", fontSize: 16, fontWeight: "600" },
  rowSub: { color: "#9C9CA3", fontSize: 12, marginTop: 2 },
  menuButton: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: "#2A2A30",
    alignItems: "center", justifyContent: "center", backgroundColor: "#1A1A1E", marginLeft: 8, zIndex: 5,
  },
  menuDots: { color: "#CFCFCF", fontSize: 18, lineHeight: 18, marginTop: -2, fontWeight: "800" },
});
