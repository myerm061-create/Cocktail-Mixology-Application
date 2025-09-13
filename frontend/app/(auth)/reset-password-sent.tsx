import { View, Text, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import FormButton from "@/components/ui/FormButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

export default function ResetRequestSentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        If an account exists with that email, we’ve sent a link to reset your password.
      </Text>

      <FormButton
        title="Back to login"
        onPress={() => {
          router.push("/(auth)/login")
        }}
      />

      <Text style={styles.smallText}>
        Didn’t get it?{" "}
        <Link href="/reset-password" asChild>
          <Text style={styles.link}>Try again</Text>
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
  smallText: {
    marginTop: 14,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: Colors.link,
  },
});
