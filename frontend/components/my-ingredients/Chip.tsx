import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

const getCategoryIcon = (label: string) => {
  switch (label) {
    case 'Spirit':
      return '🥃';
    case 'Liqueur':
      return '🍸';
    case 'Mixer':
      return '🥤';
    case 'Juice':
      return '🍊';
    case 'Garnish':
      return '🌿';
    case 'Other':
      return '📦';
    default:
      return '';
  }
};

export default function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const icon = getCategoryIcon(label);

  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active ? s.active : s.idle]}
      android_ripple={{
        color: active ? '#3B7BFF20' : '#FFFFFF10',
        borderless: true,
      }}
    >
      {icon && <Text style={s.icon}>{icon}</Text>}
      <Text style={[s.text, active && s.textActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  idle: { backgroundColor: 'transparent', borderColor: '#2A2A30' },
  active: { backgroundColor: '#1F1F24', borderColor: '#3A3A42' },
  icon: { fontSize: 14 },
  text: { fontSize: 13, color: '#CFCFCF', maxWidth: 120 },
  textActive: { color: '#FFFFFF', fontWeight: '600' },
});
