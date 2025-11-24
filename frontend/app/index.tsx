import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from './lib/auth';
import { AuthLoadingScreen } from './lib/useProtectedRoute';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}