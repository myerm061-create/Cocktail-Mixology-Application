import React from "react";
import { Pressable, Text, View, StyleSheet, ActivityIndicator, Image } from "react-native";
import GooglePng from "@/assets/images/Google.png";

type Props = {
  title?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

// A button component for Google authentication
export default function GoogleAuthButton({
  title = "Continue with Google",
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.btn, isDisabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View style={styles.row}>
        <Image
            source={GooglePng}
            style={{ width: 18, height: 18, marginRight: 10 }}
            resizeMode="contain"
        />
        <Text style={styles.text}>{loading ? "Connecting…" : title}</Text>
        {loading && <ActivityIndicator style={{ marginLeft: 8 }} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF5842",
    borderWidth: 1,
    borderColor: "#2C2A35",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.7 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  icon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});