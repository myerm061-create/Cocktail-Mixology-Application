import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FormInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: "text" | "email" | "password";
};

export default function FormInput({ placeholder, value, onChangeText, type = "text" }: FormInputProps) {
    const [secure, setSecure] = useState(type === "password");
    const renderIcon = () => {
        switch (type) {
            case "email":
                return <Ionicons name="mail-outline" size={20} color="#888" />;
            case "password":
                return (
                <TouchableOpacity onPress={() => setSecure(!secure)}>
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
            secureTextEntry={secure}
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
    fontFamily: "Ubuntu_400Regular",
    color: "#121212",
  },
  icon: {
    marginLeft: 10,
  },
});