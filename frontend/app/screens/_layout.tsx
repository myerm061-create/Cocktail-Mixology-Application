// app/screens/_layout.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, usePathname } from "expo-router";
import BottomNav from "@/components/ui/BottomNav";

const TABS = [
  { icon: "cube-outline", route: "/screens/my-ingredients" }, // Cabinet
  { icon: "person-outline", route: "/screens/user-profile" }, // Profile
];

const HIDE_ON = [
  "/screens/ingredient-scanner",
  "/screens/user-profile/edit",
];

export default function ScreensLayout() {
  const path = usePathname();
  const onATab = TABS.some((t) => path.startsWith(t.route));
  const hideHere = HIDE_ON.some((p) => path.startsWith(p));

  return (
    <View style={styles.wrap}>
      <View style={styles.content}>
        <Slot />
      </View>
      {onATab && !hideHere && (
        <View style={styles.dock}>
          <BottomNav safeArea items={TABS} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  content: { flex: 1, paddingBottom: 90 }, // leave space for dock
  dock: { position: "absolute", left: 12, right: 12, bottom: 18 },
});
