import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export type Category = "Spirit" | "Liqueur" | "Mixer" | "Juice" | "Garnish" | "Other";
export type Ingredient = { id: string; name: string; category: Category; owned: boolean; wanted?: boolean; impactScore?: number };

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
  const handleOpen = (direction: "left" | "right") => {
    if (direction === "left") onAddToShopping(item.id);
    else if (direction === "right") onRemoveFromCabinet(item.id);
    requestAnimationFrame(() => swipeRef.current?.close());
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={() => (
        <View style={[styles.actionLeft, styles.actionAdd]}>
          <Text style={styles.actionText}>Add to Cart</Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={[styles.actionRight, styles.actionRemove]}>
          <Text style={styles.actionText}>Remove</Text>
        </View>
      )}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      onSwipeableOpen={handleOpen}
      childrenContainerStyle={{ overflow: "visible" }}
    >
      <View style={styles.rowWrap}>
        <View style={styles.rowCard}>
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
  rowTextWrap: { flex: 1, marginRight: 8, overflow: "hidden" },
  rowTitle: { color: "#EDEDED", fontSize: 16, fontWeight: "600" },
  rowSub: { color: "#9C9CA3", fontSize: 12, marginTop: 2 },
  actionLeft: { flex: 1, justifyContent: "center", alignItems: "flex-start", paddingLeft: 14 },
  actionRight: { flex: 1, justifyContent: "center", alignItems: "flex-end", paddingRight: 14 },
  actionAdd: { backgroundColor: "#287D3C", borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  actionRemove: { backgroundColor: "#7D2830", borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  actionText: { color: "#FFFFFF", fontWeight: "700" },
  menuButton: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: "#2A2A30",
    alignItems: "center", justifyContent: "center", backgroundColor: "#1A1A1E", marginLeft: 8, zIndex: 5,
  },
  menuDots: { color: "#CFCFCF", fontSize: 18, lineHeight: 18, marginTop: -2, fontWeight: "800" },
});
