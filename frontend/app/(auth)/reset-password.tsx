import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

// Import custom components
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleReset = async () => {
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      alert("Invalid email: Please enter a valid email address.");
      return;
    }
    try {
      setSubmitting(true);
      // TODO: call backend API to send reset email
        console.log("Sending password reset link to:", trimmed);
    } finally {
      setSubmitting(false);
  };
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
      />

      <FormButton
        title={submitting ? "Sending..." : "Send reset link"}
        onPress={handleReset}
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
  container: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20, 
    backgroundColor: Colors.background,
  },
  title: {
    fontWeight: "bold",
    fontSize: 24, 
    marginBottom: 8, 
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary, 
    textAlign: "center",
    marginBottom: 20,
  },
  backText: {
    marginTop: 14, 
    color: Colors.textSecondary,
    fontSize: 14,
  },
  link: { 
    color: Colors.link, 
},
});
