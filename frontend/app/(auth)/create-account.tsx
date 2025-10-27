import React, { useMemo, useRef, useState } from "react";
import { router, Link } from "expo-router";
import {
  View, Text, StyleSheet, ActivityIndicator, Animated, Easing,
} from "react-native";
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import PasswordRules from "@/components/ui/PasswordRules";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

// Screen for creating a new account
export default function CreateAccountScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // simple shake anim for errors
  const shakeX = useRef(new Animated.Value(0)).current;
  const shake = () => {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  // Validation checks: Add more rules as needed
  // Check for at least 8 chars 
  const passwordValid = useMemo(
    () => password.length >= 8 && /\d/.test(password),
    [password]
  );
  const passwordsMatch = useMemo(
    () => confirmPassword.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  );
  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const allValid = useMemo(
    () => emailValid && passwordValid && passwordsMatch,
    [emailValid, passwordValid, passwordsMatch]
  );

  const handleCreate = async () => {
    if (!allValid || busy) {
      setError("Please fix the issues above.");
      shake();
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        // const data = await res.json();
        // await SecureStore.setItemAsync("access_token", data.access_token);
        // await SecureStore.setItemAsync("refresh_token", data.refresh_token);

        setSuccess("Account created! Redirecting…");
        setTimeout(() => router.replace("/home"), 600);

        return;
      }

      if (res.status === 409) {
        setError("That email is already registered. Try signing in.");
        shake();
        return;
      }

      if (res.status === 422) {
        const j = await res.json().catch(() => null);
        const msg = j?.detail?.[0]?.msg ?? "Please check your inputs.";
        setError(`Validation error: ${msg}`);
        shake();
        return;
      }

      const text = await res.text().catch(() => "");
      setError(`Registration failed (${res.status}). ${text || "Try again."}`);
      shake();
    } catch (e: any) {
      setError(`Network error: ${e?.message ?? e}`);
      shake();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
        <Text style={styles.title}>Create Account</Text>
      </Animated.View>
      <Text style={styles.subtitle}>Please enter your details</Text>

      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        type="email"
        returnKeyType="next"
        autoCapitalize="none"
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
        onSubmitEditing={handleCreate}
      />

      <PasswordRules password={password} confirmPassword={confirmPassword} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <FormButton title={busy ? "Creating…" : "Create"} onPress={handleCreate} disabled={!allValid || busy} />
      {busy ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}

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
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: Colors.background },
  title: { fontWeight: "bold", fontSize: 28, marginBottom: 10, color: Colors.textPrimary, textAlign: "center" },
  subtitle: { fontSize: 16, marginBottom: 16, color: Colors.textSecondary, textAlign: "center" },
  link: { color: Colors.link },
  newUserText: { marginTop: 15, color: Colors.textSecondary, fontSize: 14 },
  error: { marginTop: 10, color: "#ff6b6b", fontSize: 13 },
  success: { marginTop: 10, color: "#22c55e", fontSize: 13 },
});