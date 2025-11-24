import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Link, router } from 'expo-router';
import { DarkTheme as Colors } from '@/components/ui/ColorPalette';
import FormButton from '@/components/ui/FormButton';
import AuthInput from '@/components/ui/AuthInput';
import CheckBox from '@/components/ui/CheckBox';
import { useAuth } from '@/app/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();

  // shake animation
  const shakeX = useRef(new Animated.Value(0)).current;
  const shake = () => {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeX, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeX, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const pwValid = useMemo(() => password.trim().length >= 1, [password]);
  const allValid = useMemo(() => emailValid && pwValid, [emailValid, pwValid]);

  const handleLogin = async () => {
    if (!allValid || busy) {
      setError('Please enter a valid email and password.');
      shake();
      return;
    }
    setBusy(true);
    setError(null);

    try {
      await signIn(email.trim(), password, rememberMe);
      // Auth context will handle navigation to home
      setTimeout(() => router.replace('/home'), 100);
    } catch (e: any) {
      const message = e?.message || String(e);
      
      if (message.includes('401') || message.includes('Invalid')) {
        setError('Invalid email or password.');
      } else if (message.includes('422')) {
        setError('Please check your inputs.');
      } else {
        setError(`Login failed. ${message}`);
      }
      shake();
    } finally {
      setBusy(false);
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
        onSubmitEditing={() => {
          void handleLogin();
        }}
      />

      <View style={styles.row}>
        <CheckBox
          checked={rememberMe}
          onChange={setRememberMe}
          label="Keep me signed in"
        />
        <Link href="/reset-password" asChild>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Link>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FormButton
        title={busy ? 'Signing in…' : 'Login'}
        onPress={() => {
          void handleLogin();
        }}
        disabled={!allValid || busy}
      />
      {busy ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}

      <Text style={styles.newUserText}>
        New user?{' '}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 10,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  link: { color: Colors.link },
  newUserText: { marginTop: 15, color: Colors.textSecondary, fontSize: 14 },
  forgotLink: { color: Colors.link, fontSize: 14 },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  error: { marginTop: 8, color: '#ff6b6b', fontSize: 13 },
});