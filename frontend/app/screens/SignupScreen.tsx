import React, { useState } from "react";
import { router, Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCreate = () => {
    // Check for empty fields
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      alert("Missing info. Please fill in all fields.");
      return;
    }
    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords don't match. Please confirm your password.");
      return;
    }
    // Create account logic here
    console.log("Creating account with:", email, password);
    // TODO: integrate backend create account

    // Direct to login page after successful account creation for now
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Please enter your details</Text>

      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        type="email"
        returnKeyType="next"
      />

      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        type="password"
        returnKeyType="next"
      />

      <AuthInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        type="password"
        returnKeyType="go"
      />

      <FormButton title="Create" onPress={handleCreate} />
      <Text style={styles.newUserText}>
        Already have an account?{" "}
        <Link href="/login" asChild>
          <Text style={styles.link}>Sign in here</Text>
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
    backgroundColor: "#101010",
  },
  title: {
    fontFamily: "Ubuntu_700Bold",
    fontWeight: "900",
    fontSize: 28,
    marginBottom: 10,
    color: "#F5F0E1",
  },
  subtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    marginBottom: 20,
    color: "#B8B8B8",
    textAlign: "center",
  },
  link: {
    color: "#8A5CF6",
    fontFamily: "Ubuntu_500Medium",
  },
  newUserText: {
    marginTop: 15,
    color: "#B8B8B8",
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
  },
});
