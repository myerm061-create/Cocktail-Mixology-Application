import React, { useMemo, useRef, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Animated, Platform, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, router } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

// Define the type for each navigation item
type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  route: string;                         
  href?: string;                          
  match?: (path: string) => boolean;      
};

// Define the props for the BottomNav component
type Props = {
  items: Item[];
  height?: number;
  safeArea?: boolean;
};

// size of the red dot indicator
const DOT = 6;

// Bottom navigation bar with animated indicator
export default function BottomNav({
  items,
  height = 64,
  safeArea = true,
}: Props) {
  const pathname = usePathname();

  // find the first matching tab index, default to 0
  const matchedIndex = Math.max(
    0,
    items.findIndex((it) =>
      it.match ? it.match(pathname ?? "") : (pathname ?? "").startsWith(it.route)
    )
  );

  const [barW, setBarW] = useState(0);
  const [index, setIndex] = useState(matchedIndex);
  const animIndex = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    if (matchedIndex !== index) setIndex(matchedIndex);
    
  }, [matchedIndex, pathname]);

  // animate the red dot to the new index
  useEffect(() => {
    Animated.spring(animIndex, {
      toValue: index,
      useNativeDriver: false,
      bounciness: 10,
      speed: 14,
    }).start();
  }, [index]);

  // layout math for tabs
  const tabWidthPct = useMemo(() => 100 / Math.max(items.length, 1), [items.length]);
  const tabW = useMemo(() => (barW && items.length ? barW / items.length : 0), [barW, items.length]);
  const centers = useMemo(() => (tabW ? items.map((_, i) => i * tabW + tabW / 2) : []), [tabW, items.length]);
  const canAnimate = centers.length >= 2;

  const leftValue = canAnimate
    ? animIndex.interpolate({
        inputRange: centers.map((_, i) => i),
        outputRange: centers.map((c) => c - DOT / 2),
      })
    : (centers[index] ?? 0) - DOT / 2;

  // handle tab press
  const handlePress = (i: number) => {
    const next = items[i];
    if (!next) return;

    const alreadyHere = next.match
      ? next.match(pathname ?? "")
      : (pathname ?? "").startsWith(next.route);

    if (alreadyHere) {
      setIndex(i);
      return;
    }

    setIndex(i);
    router.push(next.href ?? next.route);
  };

  // the navigation bar
  const Bar = (
    <View
      onLayout={(e) => setBarW(e.nativeEvent.layout.width)}
      style={[styles.bar, { height, backgroundColor: Colors.buttonBackground }]}
    >
      {/* red dot */}
      {barW > 0 && (
        <Animated.View style={[styles.dot, { left: leftValue, backgroundColor: Colors.textRed }]} />
      )}

      {items.map((it, i) => {
        const active = i === index;
        const iconName = active && String(it.icon).endsWith("-outline")
          ? (String(it.icon).replace("-outline", "") as any)
          : it.icon;

        return (
          <Pressable
            key={`${it.route}-${i}`}
            style={[styles.tab, { width: `${tabWidthPct}%`, height }]}
            android_ripple={{ color: `${Colors.accentPrimary}33`, borderless: true }}
            onPress={() => handlePress(i)}
          >
            <Ionicons name={iconName} size={22} color={active ? Colors.textPrimary : Colors.textSecondary} />
          </Pressable>
        );
      })}
    </View>
  );

  if (!safeArea) return <View style={styles.wrap}>{Bar}</View>;
  return <SafeAreaView style={styles.wrap}>{Bar}</SafeAreaView>;
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 0,
    paddingBottom: Platform.OS === "android" ? 10 : 0,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    overflow: "hidden",
    marginHorizontal: 0,
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
