import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

// Import custom components
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Check for empty fields
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }
    // Login logic here
    console.log("Logging in with:", email, password);
    // TODO: integrate backend login account

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Please enter your account here</Text>

      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        type="email"
      />

      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        type="password"
      />

      <View style={styles.forgotContainer}>
        <Link href="/forgot-password" asChild>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Link>
      </View>

      <FormButton title="Login" onPress={handleLogin} />

      <Text style={styles.newUserText}>
        New user?{" "}
        <Link href="/signup" asChild>
          <Text style={styles.link}>Sign up here</Text>
        </Link>
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: "Ubuntu_700Bold",
    fontWeight: "900",
    fontSize: 28,
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    marginBottom: 20,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  forgotContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 10
    ,
  },
  forgotLink: {
    color: Colors.link,
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
  },
  link: {
    color: Colors.link,
    fontFamily: "Ubuntu_500Medium",
  },
  newUserText: {
    marginTop: 15,
    color: Colors.textSecondary,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
  },
});
