import React, { useMemo, useState } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import FormButton from '@/components/ui/FormButton';
import AuthInput from '@/components/ui/AuthInput';
import PasswordRules from '@/components/ui/PasswordRules';
import { DarkTheme as Colors } from '@/components/ui/ColorPalette';

async function updatePasswordAPI(_current: string, _next: string) {
  // TODO: call backend: PUT /auth/password or similar
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}

// Screen for changing password when already authenticated
export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Validation checks: Add more rules as needed
  const passwordValid = useMemo(
    () => password.length >= 6 && /\d/.test(password),
    [password],
  );
  const passwordsMatch = useMemo(
    () => confirmPassword.length > 0 && password === confirmPassword,
    [password, confirmPassword],
  );

  // should be `passwordValid && passwordsMatch`
  const allValid = useMemo(
    () => passwordValid && passwordsMatch,
    [passwordValid, passwordsMatch],
  );

  const onSubmit = async (): Promise<void> => {
    if (!allValid) {
      Alert.alert('Check your entries', 'Please fix the highlighted issues.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await updatePasswordAPI(currentPassword, password);
      if (!res?.ok) throw new Error('Unable to update password.');

      Alert.alert('Password updated', 'Your password has been changed.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Update failed', String(e?.message ?? 'Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subtitle}>Update your password for this account</Text>

      {/* Current password (most backends require this when authenticated) */}
      <AuthInput
        placeholder="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        type="password"
        returnKeyType="next"
        autoComplete="current-password"
      />

      <AuthInput
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        type="password"
        returnKeyType="next"
        autoComplete="new-password"
      />

      <AuthInput
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        type="password"
        returnKeyType="done"
      />

      <PasswordRules password={password} confirmPassword={confirmPassword} />

      {/* Wrap async handler so onPress receives a void function */}
      <FormButton
        title={submitting ? 'Updating...' : 'Update Password'}
        onPress={() => {
          void onSubmit();
        }}
        disabled={!allValid || submitting}
      />

      <Text style={styles.newUserText} onPress={() => router.back()}>
        Back to Settings
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: 'Ubuntu_700Bold',
    fontWeight: '900',
    fontSize: 28,
    marginBottom: 10,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 16,
    marginBottom: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  newUserText: {
    marginTop: 16,
    color: Colors.link,
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});
