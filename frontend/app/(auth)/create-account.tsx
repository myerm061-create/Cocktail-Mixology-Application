import React, { useMemo, useState } from "react";
import { router, Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import PasswordRules from "@/components/ui/PasswordRules";

// Screen for creating a new account
export default function CreateAccountScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation checks: Add more rules as needed
  // Check for at least 6 characters and at least one number
  const passwordValid = useMemo(
    () => password.length >= 6 && /\d/.test(password),
    [password]
  );
  // Check if passwords match and not empty
  const passwordsMatch = useMemo(
    () => confirmPassword.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  );
  // Check overall validity
  const allValid = useMemo(
    () => !!email.trim() && passwordValid && passwordsMatch,
    [email, passwordValid, passwordsMatch]
  );
  
  const handleCreate = () => {
    // Additional client-side validation
    if (!allValid) {
      alert("Please fix the highlighted issues before creating your account.");
      return;
    }
    // console.log("Creating account with:", email, password);
    // TODO: integrate backend
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

      <PasswordRules password={password} confirmPassword={confirmPassword} />

      <FormButton title="Create" onPress={handleCreate} disabled={!allValid} />

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
    backgroundColor: Colors.background,
  },
  title: {
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  link: {
    color: Colors.link,
  },
  newUserText: {
    marginTop: 15,
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
