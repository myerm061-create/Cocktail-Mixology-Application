import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { DarkTheme as Colors } from '@/components/ui/ColorPalette';

// A back button component to navigate to the previous screen
export default function BackButton() {
  const router = useRouter();
  const segments = useSegments();

  const handlePress = () => {
    if (segments.length > 1) {
      // Normal case
      router.back();
    } else {
      // No previous page
      router.replace('/home');
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
});
