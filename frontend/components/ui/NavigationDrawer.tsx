import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type MenuItem = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  route?: string;
  onPress?: () => void;
  danger?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Search", icon: "search-outline", route: "/search" },
  { label: "My Cabinet", icon: "cube-outline", route: "/cabinet" },
  { label: "Favorites", icon: "heart-outline", route: "/favorites" },
  { label: "Recommendations", icon: "sparkles-outline", route: "/assistant" },
  { label: "Settings", icon: "settings-outline", route: "/(stack)/settings" },
  { label: "Sign Out", icon: "log-out-outline", danger: true },
];

export default function NavigationDrawer({ visible, onClose }: Props) {
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const handleSignOut = async () => {
    setConfirmSignOut(false);
    onClose();

    try {
      // TODO: Call your logout endpoint if needed
      // const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";
      // await fetch(`${API_BASE}/auth/logout`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${token}`
      //   },
      // });

      // Clear local auth storage
      // await SecureStore.deleteItemAsync('authToken');
      // await SecureStore.deleteItemAsync('refreshToken');

      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleItemPress = (item: MenuItem) => {
    if (item.label === "Sign Out") {
      setConfirmSignOut(true);
      return;
    }
    
    onClose();
    if (item.route) {
      router.push(item.route as any);
    } else if (item.onPress) {
      item.onPress();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Blurred backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        </Pressable>

        {/* Drawer content */}
        <View style={styles.drawer}>
          {/* Close button */}
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>

          {/* Menu items */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => handleItemPress(item)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={item.danger ? Colors.textRed : Colors.textPrimary}
                    style={styles.menuIcon}
                  />
                )}
                <Text
                  style={[
                    styles.menuText,
                    item.danger && styles.menuTextDanger,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <ConfirmDialog
        visible={confirmSignOut}
        title="Sign Out"
        message="Do you want to log out?"
        confirmText="Log Out"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => void handleSignOut()}
      />
    </Modal>
  );
}

const DRAWER_WIDTH = 280;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.buttonBackground,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.buttonBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginLeft: 4,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemPressed: {
    backgroundColor: Colors.buttonBackground,
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  menuTextDanger: {
    color: Colors.textRed,
  },
});

