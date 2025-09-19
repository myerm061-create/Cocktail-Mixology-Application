import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, usePathname } from "expo-router";
import BottomNav from "@/components/ui/BottomNav";
import { ME_ID } from "@/scripts/data/mockProfiles";

// Constants for self profile route
const ME = String(ME_ID);
const SELF_PROFILE = `/${ME}`;

const STATIC_TAB_PREFIXES = ["/home", "/my-ingredients", "/search", "/settings"];

// Check if the path is a user profile path
const isProfilePath = (p: string) => {
  if (!p || p === "/") return false;
  if (STATIC_TAB_PREFIXES.some((s) => p.startsWith(s))) return false;
  return p.split("/").length === 2;
};

// Define the tabs for bottom navigation 
const TABS = [
  { icon: "home-outline",   route: "/home" },
  { icon: "cube-outline",   route: "/my-ingredients" },
  { icon: "search-outline", route: "/search" },
  { icon: "person-outline", route: "/", href: SELF_PROFILE, match: isProfilePath },
];

// Layout component that includes bottom navigation on tab screens
export default function TabsLayout() {
  const path = usePathname();

  // highlight the nav if current path matches the tab's base route or href
  const onATab = TABS.some(
    (t: any) => (t.match ? t.match(path) : path.startsWith(t.route))
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.content}>
        <Slot />
      </View>
      {onATab && (
        <View style={styles.dock}>
          <BottomNav safeArea items={TABS as any} />
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