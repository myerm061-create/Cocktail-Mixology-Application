import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonCard() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <View style={styles.thumbWrap}>
        <Animated.View style={[styles.thumb, { opacity }]} />
        {/* Heart button skeleton */}
        <View style={styles.heartBtn} />
      </View>
      {/* Name skeleton */}
      <View style={styles.nameContainer}>
        <Animated.View style={[styles.nameLine, { opacity }]} />
      </View>
    </View>
  );
}

const R = 14;

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  thumbWrap: {
    borderRadius: R,
    overflow: 'hidden',
    backgroundColor: '#1d1d1d',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#2a2a2a',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
  },
  nameContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  nameLine: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
    width: '80%',
  },
});
