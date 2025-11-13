import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Link, router } from "expo-router";
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

// Screen for resetting password via email
export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleReset = async () => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !isValidEmail(trimmed)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/auth/reset/request`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      // The backend returns 200 even if the account doesn't exist or you're rate-limited.
      // If it isn't 2xx (e.g., server down), show a gentle message but don't leak details.
      if (!res.ok) {
        // You can log res.status/res.json() to Sentry if you add it later.
        Alert.alert("Something went wrong", "Please try again in a moment.");
      }

      // Either way, move to the confirmation screen.
      router.push("/(auth)/reset-password-sent");
    } catch {
      Alert.alert("Network error", "Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.subtitle}>
        Enter the email associated with your account and we’ll send you a reset link.
      </Text>

      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        type="email"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <FormButton
        title={submitting ? "Sending..." : "Send reset link"}
        onPress={() => { void handleReset(); }}
        disabled={submitting || !email.trim()}
      />

      <Text style={styles.backText}>
        Remembered it?{" "}
        <Link href="/login" asChild>
          <Text style={styles.link}>Back to login</Text>
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: Colors.background },
  title: { fontWeight: "bold", fontSize: 24, marginBottom: 8, color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginBottom: 20 },
  backText: { marginTop: 14, color: Colors.textSecondary, fontSize: 14 },
  link: { color: Colors.link },
});