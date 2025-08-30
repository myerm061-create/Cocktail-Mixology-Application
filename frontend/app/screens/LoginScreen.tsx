import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Logging in with:", email, password);
    // Later: integrate Firebase / backend API here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Please enter your account here</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontFamily: "Ubuntu_400Regular",
  },
});
