import React, { useMemo, useRef, useState } from "react";
import { router, Link } from "expo-router";
import {
  View, Text, StyleSheet, ActivityIndicator, Animated, Easing, Alert,
} from "react-native";
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import PasswordRules from "@/components/ui/PasswordRules";

// Accept either env var name; fall back to local dev default
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_BASE ??
  "http://127.0.0.1:8000/api/v1";

const MIN_LEN = 10; 

export default function CreateAccountScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // simple shake animation for errors
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

  const emailTrimmed = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed), [emailTrimmed]);
  const passwordsMatch = useMemo(() => confirmPassword.length > 0 && password === confirmPassword, [password, confirmPassword]);
  const lengthOK = useMemo(() => password.length >= MIN_LEN, [password]);

  // Let the backend do the heavy lifting; UI just blocks obvious mistakes
  const allValid = useMemo(() => emailValid && lengthOK && passwordsMatch, [emailValid, lengthOK, passwordsMatch]);

  const goToPending = (targetEmail: string) => {
    const q = encodeURIComponent(targetEmail);
    router.replace(`/(auth)/verify-email-pending?email=${q}`);
  };

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
      // 1) Register
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: emailTrimmed, password }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          setError("That email is already registered. Try signing in.");
          shake();
          return;
        }
        if (res.status === 422) {
          const j = await res.json().catch(() => null);
          const msg = j?.detail?.[0]?.msg ?? j?.detail ?? "Please check your inputs.";
          setError(`Validation error: ${msg}`);
          shake();
          return;
        }
        const text = await res.text().catch(() => "");
        setError(`Registration failed (${res.status}). ${text || "Try again."}`);
        shake();
        return;
      }

      // 2) Best-effort: trigger verification email (ignore result; we route either way)
      // If your backend uses a different path, update here (e.g., /auth/verify/request).
      void fetch(`${API_BASE}/auth/verify/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: emailTrimmed }),
      }).catch(() => { /* noop */ });

      // 3) Route to “waiting/pending” screen
      setSuccess("Account created! Check your email to verify.");
      goToPending(emailTrimmed);
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
        keyboardType="email-address"
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
        onSubmitEditing={() => { void handleCreate(); }}
      />

      {/* UI-only helper; backend is the source of truth */}
      <PasswordRules password={password} confirmPassword={confirmPassword} email={emailTrimmed} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <FormButton
        title={busy ? "Creating…" : "Create"}
        onPress={() => { void handleCreate(); }}
        disabled={!allValid || busy}
      />
      {busy ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}

      <Text style={styles.newUserText}>
        Already have an account?{" "}
        <Link href="/(auth)/login" asChild>
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
  error: { marginTop: 10, color: "#ff6b6b", fontSize: 13, textAlign: "center" },
  success: { marginTop: 10, color: "#22c55e", fontSize: 13, textAlign: "center" },
});
