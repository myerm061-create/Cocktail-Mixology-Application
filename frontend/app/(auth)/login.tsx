import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from "react-native";
import { Link, router } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import CheckBox from "@/components/ui/CheckBox";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";
// import * as SecureStore from "expo-secure-store"; // TODO: persist tokens

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [busy, setBusy] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // shake animation
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

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const pwValid = useMemo(() => password.trim().length >= 1, [password]);
  const allValid = useMemo(() => emailValid && pwValid, [emailValid, pwValid]);

  const handleLogin = async () => {
    if (!allValid || busy) {
      setError("Please enter a valid email and password.");
      shake();
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        // const data = await res.json();
        // if (rememberMe) {
        //   await SecureStore.setItemAsync("access_token", data.access_token);
        //   await SecureStore.setItemAsync("refresh_token", data.refresh_token);
        // }
        setSuccess("Signed in! Redirecting…");
        setTimeout(() => router.replace("/home"), 500);
        return;
      }

      if (res.status === 401) {
        setError("Invalid email or password.");
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
      setError(`Login failed (${res.status}). ${text || "Try again."}`);
      shake();
    } catch (e: any) {
      setError(`Network error: ${e?.message ?? e}`);
      shake();
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setGLoading(true);
      // TODO: start Google flow here
    } finally {
      setGLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
        <Text style={styles.title}>Sign in</Text>
      </Animated.View>
      <Text style={styles.subtitle}>Please enter your account here</Text>

      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        type="email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />

      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        type="password"
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => { void handleLogin(); }}
      />

      <View style={styles.row}>
        <CheckBox checked={rememberMe} onChange={setRememberMe} label="Keep me signed in" />
        <Link href="/reset-password" asChild>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Link>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <FormButton
        title={busy ? "Signing in…" : "Login"}
        onPress={() => { void handleLogin(); }}
        disabled={!allValid || busy}
      />
      {busy ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      <GoogleAuthButton onPress={() => { void handleGoogle(); }} loading={gLoading} />

      <Text style={styles.newUserText}>
        New user?{" "}
        <Link href="/create-account" asChild>
          <Text style={styles.link}>Sign up here</Text>
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: Colors.background },
  title: { fontWeight: "bold", fontSize: 28, marginBottom: 10, color: Colors.textPrimary, textAlign: "center" },
  subtitle: { fontSize: 16, marginBottom: 20, color: Colors.textSecondary, textAlign: "center" },
  link: { color: Colors.link },
  newUserText: { marginTop: 15, color: Colors.textSecondary, fontSize: 14 },
  forgotLink: { color: Colors.link, fontSize: 14 },
  row: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  dividerRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 12 },
  divider: { flex: 1, height: 1, backgroundColor: "#2C2A35" },
  dividerText: { color: Colors.textSecondary, fontSize: 12 },
  error: { marginTop: 8, color: "#ff6b6b", fontSize: 13 },
  success: { marginTop: 8, color: "#22c55e", fontSize: 13 },
});
