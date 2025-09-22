import React, { useState } from "react";
import {
  View, Text, StyleSheet, Switch, Pressable,
  LayoutAnimation, Platform, UIManager,
} from "react-native";
import { router, Stack } from "expo-router";
import FormButton from "@/components/ui/FormButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BackButton from "@/components/ui/BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function Chevron({ open }: { open: boolean }) {
  return <Text style={styles.chevron}>{open ? "˅" : "›"}</Text>;
}

export default function SettingsScreen() {
  const [push, setPush] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [showDeleteLocal, setShowDeleteLocal] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showUnits, setShowUnits] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [useMetric, setUseMetric] = useState(false);
  const [confirmClearCache, setConfirmClearCache] = useState(false);
  const [confirmDeleteAcct, setConfirmDeleteAcct] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const insets = useSafeAreaInsets();

  const toggle = (fn: (v: boolean) => void) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    fn((v) => !v);
  };

  return (
    <>
      {/* Hide default header/back button */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.backWrap}>
        <BackButton />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Notifications */}
        <Text style={styles.section}>Notifications</Text>
        <Row
          label="Push Notification"
          right={
            <Switch
              value={push}
              onValueChange={setPush}
              trackColor={{ false: Colors.textSecondary, true: Colors.textSecondary }}
              thumbColor={Colors.textPrimary}
              ios_backgroundColor={Colors.textSecondary}
            />
          }
        />

        {/* Profile */}
        <Text style={styles.section}>Profile</Text>
        <Row
          label="Public Profile"
          right={
            <Switch
              value={publicProfile}
              onValueChange={setPublicProfile}
              trackColor={{ false: Colors.textSecondary, true: Colors.textSecondary }}
              thumbColor={Colors.textPrimary}
              ios_backgroundColor={Colors.textSecondary}
            />
          }
        />

        {/* Account */}
        <Text style={styles.section}>Account</Text>
        <Row
          label="Delete My Local Data"
          right={<Chevron open={showDeleteLocal} />}
          onPress={() => toggle(setShowDeleteLocal)}
        />
        {showDeleteLocal && (
          <View style={styles.reveal}>
            <FormButton title="Clear Local Cache" onPress={() => setConfirmClearCache(true)} />
          </View>
        )}

        <Row
          label="Delete My Account"
          right={<Chevron open={showDeleteAccount} />}
          onPress={() => toggle(setShowDeleteAccount)}
        />
        {showDeleteAccount && (
          <View style={styles.reveal}>
            <FormButton
              title="Delete Account (Permanent)"
              onPress={() => setConfirmDeleteAcct(true)}
              variant="danger"
            />
          </View>
        )}

        {/* General */}
        <Text style={styles.section}>General</Text>
        <Row
          label="Alcohol Calculator Units"
          right={<Chevron open={showUnits} />}
          onPress={() => toggle(setShowUnits)}
        />
        {showUnits && (
          <View style={[styles.reveal, { flexDirection: "row", gap: 10 }]}>
            <Pressable
              style={[styles.chip, !useMetric && styles.chipActive]}
              onPress={() => setUseMetric(false)}
            >
              <Text style={[styles.chipText, !useMetric && styles.chipTextActive]}>oz (Imperial)</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, useMetric && styles.chipActive]}
              onPress={() => setUseMetric(true)}
            >
              <Text style={[styles.chipText, useMetric && styles.chipTextActive]}>ml (Metric)</Text>
            </Pressable>
          </View>
        )}

        <Row
          label="Change Password"
          right={<Chevron open={showChangePw} />}
          onPress={() => toggle(setShowChangePw)}
        />
        {showChangePw && (
          <View style={styles.reveal}>
            <FormButton
              title="Go to Change Password"
              onPress={() => console.log("navigate to change-password")}
            />
          </View>
        )}

        {/* Bottom Sign Out */}
        <View style={styles.footer}>
          <FormButton title="Sign Out" onPress={() => setConfirmSignOut(true)} variant="dangerLogo" />
        </View>
      </ScrollView>

      {/* Confirm dialogs */}
      <ConfirmDialog
        visible={confirmClearCache}
        title="Clear Local Cache"
        message="This will remove locally stored data on this device."
        confirmText="Clear Cache"
        onCancel={() => setConfirmClearCache(false)}
        onConfirm={() => {
          setConfirmClearCache(false);
          console.log("clear local data");
        }}
      />

      <ConfirmDialog
        visible={confirmDeleteAcct}
        title="Delete Account"
        message="This permanently deletes your account and data."
        confirmText="Delete Account"
        onCancel={() => setConfirmDeleteAcct(false)}
        onConfirm={() => {
          setConfirmDeleteAcct(false);
          console.log("delete account");
          router.replace("/(auth)/login");
        }}
      />

      <ConfirmDialog
        visible={confirmSignOut}
        title="Sign Out"
        message="Do you want to log out?"
        confirmText="Log Out"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => {
          setConfirmSignOut(false);
          console.log("sign out");
          router.replace("/(auth)/login");
        }}
      />
    </>
  );
}

function Row({
  label,
  right,
  onPress,
}: {
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ marginLeft: 12 }}>{right}</View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  backWrap: { position: "absolute", top: 14, left: 14, zIndex: 10 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 12 },
  section: { marginTop: 18, marginBottom: 6, fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  row: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontSize: 16, color: Colors.textSecondary },
  chevron: { fontSize: 22, color: Colors.textSecondary, includeFontPadding: false },
  reveal: { paddingVertical: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: Colors.buttonBackground },
  chipActive: { backgroundColor: "#2a2a2a" },
  chipText: { color: Colors.textSecondary, fontWeight: "600" },
  chipTextActive: { color: Colors.textPrimary },
  footer: { marginTop: 16 }, 
});
