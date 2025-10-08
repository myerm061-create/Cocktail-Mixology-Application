import { Stack } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
