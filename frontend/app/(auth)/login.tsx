import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link, router } from "expo-router";

// Import custom components
import FormButton from "@/components/ui/FormButton";
import AuthInput from "@/components/ui/AuthInput";
import CheckBox from "@/components/ui/CheckBox";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }
    if (email === "test@test.com" && password === "test") {
      alert("Login successful (Test account)");
      router.push("/home");
      return;
    }

    // TODO: login logic -> if rememberMe true
    alert("Invalid credentials.");
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
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Please enter your account here</Text>

      <AuthInput placeholder="Email" value={email} onChangeText={setEmail} type="email" />
      <AuthInput placeholder="Password" value={password} onChangeText={setPassword} type="password" />

      <View style={styles.row}>
        <CheckBox checked={rememberMe} onChange={setRememberMe} label="Keep me signed in" />
        <Link href="/reset-password" asChild>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Link>
      </View>

      <FormButton title="Login" onPress={handleLogin} />

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      <GoogleAuthButton onPress={handleGoogle} loading={gLoading} />

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
  row: { 
    width: "100%", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 12 
  },
  dividerRow: { 
    width: "100%", 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    marginVertical: 12
  },
  divider: { 
    flex: 1, 
    height: 1, 
    backgroundColor: "#2C2A35" 
  },
  dividerText: { 
    color: Colors.textSecondary, 
    fontSize: 12 
  },
});
