import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { DarkTheme as Colors } from '@/components/ui/ColorPalette';
import FormButton from '@/components/ui/FormButton';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actionsRow}>
            <FormButton
              title={cancelText}
              onPress={onCancel}
              style={styles.actionBtn}
            />
            <FormButton
              title={confirmText}
              onPress={onConfirm}
              variant="danger"
              style={styles.actionBtn}
            />
          </View>

          <Pressable style={styles.closeHit} onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Colors.richCharcoal ?? Colors.buttonBackground,
    padding: 20,
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actionBtn: {
    width: '48%',
    height: 44,
    borderRadius: 22,
    marginTop: 0,
  },
  closeHit: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
  },
});
