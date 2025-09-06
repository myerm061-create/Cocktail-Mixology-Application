import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";

type PasswordRulesProps = {
  password: string;
  confirmPassword: string; 
};

export default function PasswordRules({ password, confirmPassword }: PasswordRulesProps) {
  const checks = useMemo(
    () => ({
      len6: password.length >= 6,
      hasNum: /\d/.test(password),
      match: confirmPassword.length > 0 && password === confirmPassword,
    }),
    [password, confirmPassword]
  );

  const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
    <View style={styles.ruleRow}>
      <View style={[styles.bullet, ok ? styles.bulletOk : styles.bulletNot]} />
      <Text style={[styles.ruleText, ok ? styles.textOk : styles.textNot]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={styles.wrap} accessibilityLabel="Password requirements">
      <Text style={styles.header}>Password must include:</Text>
      <Rule ok={checks.len6} label="At least 6 characters" />
      <Rule ok={checks.hasNum} label="Contains a number" />
      <Rule ok={checks.match} label="Passwords match" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    marginTop: -5, 
    paddingVertical: 8, 
    alignSelf: "center"
 },
  header: { 
    color: Colors.textSecondary, 
    fontSize: 16, 
    marginBottom: 10,
    fontFamily: "Ubuntu_400Regular"  
 },
  ruleRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 6
 },
  bullet: {
    width: 16,
    height: 16,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 2,
  },
  bulletOk: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.link,
  },
  bulletNot: {
    backgroundColor: "transparent",
    borderColor: "#5A585F",
  },
  ruleText: { 
    fontSize: 14
},
  textOk: { 
    color: Colors.link, 
    fontFamily: "Ubuntu_400Regular"  
  },
  textNot: { 
    color: "#C5C5C5", 
    fontFamily: "Ubuntu_400Regular" 
  },
});