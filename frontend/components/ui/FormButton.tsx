import React from "react";
import type {
  GestureResponderEvent,
  ViewStyle,
  TextStyle} from "react-native";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

type Props = {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "default" | "danger" | "dangerLogo";
  logoSource?: any; // optional custom logo, falls back to signout.png
};

// A customizable button component for forms and actions
export default function FormButton({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  variant = "default",
  logoSource,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.btn, isDisabled && styles.btnDisabled, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          {variant === "dangerLogo" && (
            <Image
              source={logoSource || require("@/assets/images/signout.png")}
              style={[styles.logo, { tintColor: Colors.textRed }]}
            />
          )}
          <Text
            style={[
              styles.text,
              (variant === "danger" || variant === "dangerLogo") && {
                color: Colors.textRed,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.buttonBackground,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row", // allow logo + text
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 8,
  },
});
