import React, { useMemo, useRef, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Animated, Platform, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

type Item = { icon: keyof typeof Ionicons.glyphMap; onPress?: () => void };
type Props = { items: Item[]; activeIndex?: number; safeArea?: boolean; height?: number };

const DOT = 6;

export default function BottomNav({
  items,
  activeIndex = 0,
  safeArea = true,
  height = 64,
}: Props) {
  const animIndex = useRef(new Animated.Value(activeIndex)).current;
  const [barW, setBarW] = useState(0);

  useEffect(() => {
    Animated.spring(animIndex, {
      toValue: activeIndex,
      useNativeDriver: false,
      bounciness: 10,
      speed: 14,
    }).start();
  }, [activeIndex]);

  // % width for each tab
  const tabWidthPct = useMemo(() => 100 / Math.max(items.length, 1), [items.length]);

  // Pixel math for the dot
  const tabW = useMemo(() => (barW && items.length ? barW / items.length : 0), [barW, items.length]);
  const centers = useMemo(
    () => (tabW ? items.map((_, i) => i * tabW + tabW / 2) : []),
    [tabW, items.length]
  );

  const canAnimate = centers.length >= 2;
  const clampedIndex = Math.min(Math.max(activeIndex, 0), Math.max(items.length - 1, 0));

  const leftValue = canAnimate
    ? animIndex.interpolate({
        inputRange: centers.map((_, i) => i),
        outputRange: centers.map((c) => c - DOT / 2),
      })
    :
      (centers[clampedIndex] ?? 0) - DOT / 2;

  const Bar = (
    <View
      onLayout={(e) => setBarW(e.nativeEvent.layout.width)}
      style={[styles.bar, { height, backgroundColor: Colors.buttonBackground ?? "#1A1A1A" }]}
    >
      {/* red dot */}
      {barW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dot,
            {
              left: leftValue,
              backgroundColor: Colors.textRed ?? "#FF6B6B",
            },
          ]}
        />
      )}

      {items.map((it, i) => (
        <Pressable
          key={`${it.icon}-${i}`}
          style={[styles.tab, { width: `${tabWidthPct}%`, height }]}
          android_ripple={{ color: (Colors.textPrimary ?? "#6366F1") + "22", borderless: true }}
          onPress={it.onPress}
        >
          <Ionicons
            name={it.icon}
            size={22}
            color={i === activeIndex ? Colors.textPrimary ?? "#fff" : Colors.textSecondary ?? "#BDBDBD"}
          />
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
  },
  dot: {
    position: "absolute",
    bottom: 6,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
});
