import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import type { Category } from "./CabinetRow";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

export type Ingredient = { id: string; name: string; category: Category; owned: boolean; wanted?: boolean };

export default function ShoppingRow({
  item,
  onToggleMenu,
  onToggleWanted,
}: {
  item: Ingredient;
  onToggleMenu: (id: string) => void;
  onToggleWanted: (id: string) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const handleOpen = (direction: "left" | "right") => {
    if (direction === "left") onToggleWanted(item.id);
    else if (direction === "right") {
      // Remove from shopping list
      onToggleWanted(item.id);
    }
    requestAnimationFrame(() => swipeRef.current?.close());
  };

  // animated swipeable actions
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.leftActionContainer}>
        <Animated.View style={[styles.leftAction, { transform: [{ scale }] }]}>
          <Text style={styles.actionIcon}>✓</Text>
          <Text style={styles.actionLabel}>Check</Text>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.rightActionContainer}>
        <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionLabel}>Remove</Text>
        </Animated.View>
      </View>
    );
  };

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
        <View style={styles.row}>
          <Pressable
            onPress={() => onToggleWanted(item.id)}
            style={[styles.checkbox, item.wanted && styles.checkboxChecked]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!item.wanted }}
          >
            {item.wanted ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </Pressable>

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
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 10,
    backgroundColor: Colors.buttonBackground, borderColor: "#232329", borderWidth: 1, borderRadius: 14,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#3C3C46",
    alignItems: "center", justifyContent: "center", backgroundColor: "transparent", marginRight: 12,
  },
  checkboxChecked: { backgroundColor: Colors.accentPrimary, borderColor: Colors.accentPrimary },
  checkboxMark: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  rowTextWrap: { flex: 1, marginRight: 8, overflow: "hidden" },
  rowTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "600" },
  rowSub: { color: Colors.textSecondary ?? "#9BA3AF", fontSize: 12, marginTop: 2 },
  menuButton: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: "#2A2A30",
    alignItems: "center", justifyContent: "center", backgroundColor: Colors.buttonBackground, marginLeft: 8, zIndex: 5,
  },
  menuDots: { color: "#CFCFCF", fontSize: 18, lineHeight: 18, marginTop: -2, fontWeight: "800" },
  // Swipeable action containers
  leftActionContainer: { 
    flex: 1, 
    backgroundColor: "#1E8449", 
    justifyContent: "center", 
    alignItems: "flex-start",
    paddingLeft: 20,
    borderRadius: 14,
    marginVertical: 4,
  },
  rightActionContainer: { 
    flex: 1, 
    backgroundColor: "#C0392B", 
    justifyContent: "center", 
    alignItems: "flex-end",
    paddingRight: 20,
    borderRadius: 14,
    marginVertical: 4,
  },
  leftAction: {
    alignItems: "center",
    justifyContent: "center",
  },
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
