import React, { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Alert } from 'react-native';
import FormButton from '@/components/ui/FormButton';
import AuthInput from '@/components/ui/AuthInput';
import { DarkTheme as Colors } from '@/components/ui/ColorPalette';
import PasswordRules from '@/components/ui/PasswordRules';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_BASE ??
  'http://127.0.0.1:8000/api/v1';

export default function NewPasswordScreen() {
  const { email, code } = useLocalSearchParams<{
    email?: string;
    code?: string;
  }>();
  const normalizedEmail = useMemo(
    () => (email || '').toLowerCase().trim(),
    [email],
  );
  const normalizedCode = useMemo(() => (code || '').replace(/\D/g, ''), [code]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordValid = useMemo(
    () => password.length >= 8 && /\d/.test(password),
    [password],
  );
  const passwordsMatch = useMemo(
    () => confirmPassword.length > 0 && password === confirmPassword,
    [password, confirmPassword],
  );
  const allValid = useMemo(
    () =>
      !!normalizedEmail && !!normalizedCode && passwordValid && passwordsMatch,
    [normalizedEmail, normalizedCode, passwordValid, passwordsMatch],
  );

  const handleSubmit = async () => {
    if (!allValid || submitting) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/auth/reset/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          code: normalizedCode,
          new_password: password,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        Alert.alert(
          'Couldn’t reset password',
          txt || 'Invalid or expired code.',
        );
        return;
      }
      Alert.alert(
        'Password updated',
        'You can now sign in with your new password.',
      );
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Network error', e?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Set a new password for {normalizedEmail || 'your account'}.
      </Text>

      <AuthInput
        placeholder="New password"
        value={password}
        onChangeText={setPassword}
        type="password"
        returnKeyType="next"
      />

      <AuthInput
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        type="password"
        returnKeyType="go"
      />

      <PasswordRules password={password} confirmPassword={confirmPassword} />

      <FormButton
        title={submitting ? 'Updating…' : 'Reset Password'}
        onPress={() => {
          void handleSubmit();
        }}
        disabled={!allValid || submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
