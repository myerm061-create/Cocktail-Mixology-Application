import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

type PasswordRulesProps = {
  password: string;
  confirmPassword: string;
  email?: string;
};

const MIN_LEN = 12;

export default function PasswordRules({ password, confirmPassword, email }: PasswordRulesProps) {
  const checks = useMemo(() => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNum   = /\d/.test(password);
    const hasSym   = /[^\w\s]/.test(password); // any non-alnum symbol
    const lenOK    = password.length >= MIN_LEN;
    const match    = confirmPassword.length > 0 && password === confirmPassword;
    const emailPart = (email ?? "").split("@", 1)[0].toLowerCase();
    const containsEmail = !!emailPart && password.toLowerCase().includes(emailPart);

    return { hasUpper, hasLower, hasNum, hasSym, lenOK, match, containsEmail };
  }, [password, confirmPassword, email]);

  const Rule = ({ ok, label, warn = false }: { ok: boolean; label: string; warn?: boolean }) => (
    <View style={styles.ruleRow}>
      <View style={[styles.bullet, ok ? styles.bulletOk : styles.bulletNot]} />
      <Text style={[styles.ruleText, ok ? styles.textOk : warn ? styles.textWarn : styles.textNot]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={styles.wrap} accessibilityLabel="Password requirements">
      <Text style={styles.header}>Password must include:</Text>
      <Rule ok={checks.lenOK}   label={`At least ${MIN_LEN} characters`} />
      <Rule ok={checks.hasUpper} label="An uppercase letter (A–Z)" />
      <Rule ok={checks.hasLower} label="A lowercase letter (a–z)" />
      <Rule ok={checks.hasNum}   label="A number (0–9)" />
      <Rule ok={checks.hasSym}   label="A symbol (!@#$…)" />
      {typeof email === "string" && email.length > 0 && (
        <Rule
          ok={!checks.containsEmail}
          label="Does not contain your email name"
          warn
        />
      )}
      <Rule ok={checks.match} label="Passwords match" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: -2, paddingVertical: 4, alignSelf: "center" },
  header: { color: Colors.textSecondary, fontSize: 14, marginBottom: 6 },
  ruleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  bullet: { width: 14, height: 14, borderRadius: 999, marginRight: 8, borderWidth: 2 },
  bulletOk: { backgroundColor: Colors.accentPrimary, borderColor: Colors.link },
  bulletNot: { backgroundColor: "transparent", borderColor: "#5A585F" },
  ruleText: { fontSize: 13 },
  textOk: { color: Colors.link },
  textNot: { color: "#C5C5C5" },
  textWarn: { color: "#E4C566" },
});
