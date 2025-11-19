import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';

type Action = { label: string; danger?: boolean; onPress: () => void };

export default function ActionSheet({
  visible,
  onClose,
  actions,
}: {
  visible: boolean;
  onClose: () => void;
  actions: Action[];
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        {actions.map((a, i) => (
          <Pressable
            key={i}
            onPress={() => {
              onClose();
              a.onPress();
            }}
            style={({ pressed }) => [
              styles.item,
              pressed && { backgroundColor: '#202028' },
            ]}
          >
            <Text style={[styles.itemText, a.danger && { color: '#FF8A99' }]}>
              {a.label}
            </Text>
          </Pressable>
        ))}
        <View style={styles.divider} />
        <Pressable onPress={onClose} style={styles.item}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  container: {
    backgroundColor: '#16161B',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#2A2A35',
    paddingBottom: 12,
    paddingTop: 6,
  },
  handleWrap: { alignItems: 'center', paddingVertical: 6 },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#2F2F3A',
  },
  item: { paddingHorizontal: 18, paddingVertical: 14 },
  itemText: {
    color: '#EDEDF7',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  cancelText: {
    color: '#CFCFE6',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: '#2C2C34', marginHorizontal: 8 },
});
