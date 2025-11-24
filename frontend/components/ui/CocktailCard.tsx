import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme as Colors } from '@/components/ui/ColorPalette';

type Props = {
  id: string | number;
  name: string;
  thumbUrl?: string | null;
  onPress?: (id: string | number) => void; // open details
  isFavorite?: boolean; // default true for Favorites screen
  onToggleFavorite?: (id: string | number, next: boolean) => void; // toggle/remove handler
};

export default function CocktailCard({
  id,
  name,
  thumbUrl,
  onPress,
  isFavorite = true,
  onToggleFavorite,
}: Props) {
  const [loading, setLoading] = useState(!!thumbUrl);
  const [error, setError] = useState(false);
  const [fav, setFav] = useState(!!isFavorite);
  React.useEffect(() => {
    setFav(!!isFavorite);
  }, [isFavorite]);

  const toggleFav = () => {
    const next = !fav;
    setFav(next);
    onToggleFavorite?.(id, next);
  };

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}`}
      style={styles.card}
    >
      <View style={styles.thumbWrap}>
        {thumbUrl && !error ? (
          <>
            <Image
              testID="cocktail-image"
              source={{ uri: thumbUrl }}
              style={styles.thumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={100}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setError(true);
                setLoading(false);
              }}
            />
            {/* Gradient overlay at bottom for better text contrast */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              locations={[0.6, 1]}
              style={styles.gradientOverlay}
            />
          </>
        ) : (
          <View style={[styles.thumb, styles.fallback]} />
        )}
        {loading && (
          <ActivityIndicator testID="cocktail-loader" style={styles.loader} />
        )}

        {/* Heart button overlay - larger and more visible */}
        <Pressable
          onPress={toggleFav}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            fav ? 'Remove from favorites' : 'Add to favorites'
          }
          style={styles.heartBtn}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={20}
            color={fav ? Colors.textRed : '#FFFFFF'}
          />
        </Pressable>
      </View>

      <Text numberOfLines={2} style={styles.name}>
        {name}
      </Text>
    </Pressable>
  );
}

const R = 14;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbWrap: {
    borderRadius: R,
    overflow: 'hidden',
    backgroundColor: '#1d1d1d',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  thumb: {
    width: '100%',
    aspectRatio: 1,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#232323',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  name: {
    marginTop: 10,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
