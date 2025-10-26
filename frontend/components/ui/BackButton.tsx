import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";

/**
 * BackButton
 * Navigates back if previous segments exist, otherwise replaces with /home.
 */
export default function BackButton() {
  const router = useRouter();
  const segments = useSegments();

  const handlePress = () => {
    if (segments && segments.length > 0) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="arrow-back"
      testID="back-button"
      onPress={handlePress}
      style={{ padding: 8 }}
    >
      <Ionicons name="arrow-back" size={24} color="#fff" />
      {/* fallback text for test environments */}
      <Text accessibilityLabel="arrow-back" style={{ display: "none" }}>
        Back
      </Text>
    </Pressable>
  );
}
