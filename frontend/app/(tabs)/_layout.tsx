import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, usePathname } from "expo-router";
import BottomNav from "@/components/ui/BottomNav";

const TABS = [
  { icon: "home-outline",  route: "/home" },
  { icon: "cube-outline",  route: "/my-ingredients" },
  { icon: "person-outline",route: "/user-profile" },
];

export default function TabsLayout() {
  const path = usePathname();
  const onATab = TABS.some(t => path.startsWith(t.route));

  return (
    <View style={styles.wrap}>
      <View style={styles.content}>
        <Slot />
      </View>
      {onATab && (
        <View style={styles.dock}>
          <BottomNav safeArea items={TABS} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  content: { flex: 1, paddingBottom: 90 },
  dock: { position: "absolute", left: 12, right: 12, bottom: 18 },
});