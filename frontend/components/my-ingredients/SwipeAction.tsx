import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

interface SwipeActionProps {
  progress: Animated.AnimatedInterpolation<number>;
  icon: string;
  label: string;
  backgroundColor: string;
  alignLeft?: boolean;
}

export default function SwipeAction({ 
  progress, 
  icon, 
  label, 
  backgroundColor, 
  alignLeft = false 
}: SwipeActionProps) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });

  const containerStyle = [
    styles.container,
    { backgroundColor },
    alignLeft ? styles.leftAlign : styles.rightAlign,
  ];

  return (
    <View style={containerStyle}>
      <Animated.View style={[styles.action, { transform: [{ scale }] }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    borderRadius: 14,
    marginVertical: 4,
  },
  leftAlign: {
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  rightAlign: {
    alignItems: "flex-end",
    paddingRight: 20,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
