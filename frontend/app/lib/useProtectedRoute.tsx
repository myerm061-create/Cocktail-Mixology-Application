import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { DarkTheme as Colors } from '@/components/ui/ColorPalette';

/*
 Protected route wrapper that handles authentication state
 Redirects to login if not authenticated, or to
 home if authenticated on auth routes 
*/

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected route
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and on auth route
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, segments, isLoading, router]);
}

/**
 * Loading screen component shown while checking authentication
 */
export function AuthLoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.accentPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});