// src/components/SettingsToggle.tsx
// Linked Requirement: FR-18 (Settings Mgmt)
// A tiny, testable toggle row for a settings screen.

import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  testID?: string;
};

export default function SettingsToggle({ label, value, onChange, testID }: Props) {
  return (
    <View style={styles.row}>
      <Text accessibilityRole="text" style={styles.label}>
        {label}
      </Text>
      <Switch
        testID={testID || "settings-toggle"}
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
  },
});
