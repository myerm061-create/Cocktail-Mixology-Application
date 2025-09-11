import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from "react-native";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";


type Props = {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function FormButton({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
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
        <Text style={[styles.text, textStyle]}>{title}</Text>
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
});
