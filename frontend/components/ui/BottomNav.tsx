import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  SafeAreaView,
  LayoutChangeEvent,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

type NavItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  href?: string;           // optional if you later want router.navigate
  onPress?: () => void;    // or custom handler
  badgeCount?: number;
};

type Props = {
  items: NavItem[];
  activeIndex?: number;    // controlled index (visual only is fine)
  height?: number;         // bar height
  safeArea?: boolean;
  showLabels?: boolean;    // default false for icons-only
  indicator?: "dot" | "pill"; // choose your style
};

const DOT = 6;

export default function BottomNav({
  items,
  activeIndex = 0,
  height = 64,
  safeArea = true,
  showLabels = false,
  indicator = "dot",
}: Props) {
  const idx = Math.min(Math.max(activeIndex, 0), items.length - 1);
  const anim = useRef(new Animated.Value(idx)).current;
  const [barW, setBarW] = useState(0);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: idx,
      useNativeDriver: false,
      bounciness: 10,
      speed: 14,
    }).start();
  }, [idx]);

  const tabW = useMemo(() => (barW && items.length ? barW / items.length : 0), [barW, items.length]);

  const centers = useMemo(() => {
    if (!tabW) return [0];
    return items.map((_, i) => i * tabW + tabW / 2);
  }, [tabW, items.length]);

  const onLayoutBar = (e: LayoutChangeEvent) => setBarW(e.nativeEvent.layout.width);

  const Bar = (
    <View onLayout={onLayoutBar} style={[styles.bar, { height, backgroundColor: Colors.buttonBackground ?? "#1A1A1A" }]}>
      {/* indicator */}
      {barW > 0 && indicator === "dot" && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dot,
            {
              width: DOT,
              height: DOT,
              left: anim.interpolate({
                inputRange: centers.map((_, i) => i),
                outputRange: centers.map((c) => c - DOT / 2),
              }),
              backgroundColor: Colors.textRed ?? "#FF6B6B",
            },
          ]}
        />
      )}

      {barW > 0 && indicator === "pill" && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: tabW - 12,           // inset a bit for a nicer pill
              left: anim.interpolate({
                inputRange: centers.map((_, i) => i),
                outputRange: centers.map((c) => c - (tabW - 12) / 2),
              }),
              backgroundColor: (Colors.primary ?? "#4F46E5") + "20",
              borderColor: Colors.primary ?? "#4F46E5",
            },
          ]}
        />
      )}

      {/* tabs */}
      {items.map((it, i) => (
        <Pressable
          key={`${it.icon}-${i}`}
          style={[styles.tab, { width: tabW || `${100 / Math.max(items.length, 1)}%`, height }]}
          android_ripple={{ color: (Colors.primary ?? "#6366F1") + "22", borderless: true }}
          onPress={it.onPress}
        >
          <Ionicons
            name={it.icon}
            size={22}
            color={i === idx ? Colors.textPrimary ?? "#fff" : Colors.textSecondary ?? "#BDBDBD"}
          />

          {showLabels && !!it.label && (
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: i === idx ? Colors.text ?? "#fff" : Colors.textSecondary ?? "#BDBDBD" },
              ]}
            >
              {it.label}
            </Text>
          )}

          {!!it.badgeCount && it.badgeCount > 0 && (
            <View style={[styles.badge, { backgroundColor: Colors.primary ?? "#4F46E5" }]}>
              <Text style={styles.badgeText}>{it.badgeCount > 99 ? "99+" : it.badgeCount}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );

  if (!safeArea) return <View style={styles.wrap}>{Bar}</View>;
  return <SafeAreaView style={styles.wrap}>{Bar}</SafeAreaView>;
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "android" ? 10 : 0,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    overflow: "hidden",
    // no outline:
    borderWidth: 0,

    // floating look:
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  dot: {
    position: "absolute",
    bottom: 6,
    borderRadius: DOT / 2,
  },
  pill: {
    position: "absolute",
    top: 8,
    bottom: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: "18%",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
