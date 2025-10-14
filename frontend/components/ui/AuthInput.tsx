import React, { useState } from "react";
import type { TextInputProps } from "react-native";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BaseProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: "text" | "email" | "password";
};

type FormInputProps = BaseProps &
  Omit<TextInputProps, "value" | "onChangeText" | "placeholder" | "secureTextEntry">;

export default function FormInput({
  placeholder,
  value,
  onChangeText,
  type = "text",
  keyboardType,
  autoCapitalize,
  ...rest
}: FormInputProps) {
  const [secure, setSecure] = useState(type === "password");

  const isPassword = type === "password";
  const resolvedSecure = isPassword ? secure : false;
  const resolvedKeyboard = keyboardType ?? (type === "email" ? "email-address" : "default");
  const resolvedCapitalize = autoCapitalize ?? (type === "email" ? "none" : "sentences");

  const renderIcon = () => {
    switch (type) {
      case "email":
        return <Ionicons name="mail-outline" size={20} color="#888" />;
      case "password":
        return (
          <TouchableOpacity onPress={() => setSecure(!secure)} accessibilityRole="button">
            <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
          </TouchableOpacity>
        );
      default:
        return <Ionicons name="lock-closed-outline" size={20} color="#888" />;
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={resolvedSecure}
        keyboardType={resolvedKeyboard}
        autoCapitalize={resolvedCapitalize}
        {...rest}
      />
      <View style={styles.icon}>{renderIcon()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: "#fff",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#121212",
  },
  icon: {
    marginLeft: 10,
  },
});
