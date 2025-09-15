import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import FormButton from "@/components/ui/FormButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import { profiles, ME_ID, type Profile } from "@/scripts/data/mockProfiles";

const USERNAME_RE = /^(?!_)([a-z0-9_]{3,20})(?<!_)$/; // 3–20, lowercase, numbers, _, no leading/trailing _

export default function ProfileEditScreen() {
  // load current user from mock store
  const me = ME_ID;
  const meProfile: Profile = useMemo(() => profiles[me], [me]);

  // local form state
  const [displayName, setDisplayName] = useState(meProfile.name || "");
  const [username, setUsername] = useState(
    // if you store it on Profile later, pull from there; for now demo value:
    meProfile.id === "bob" ? "bobdrinksalot424" : meProfile.id
  );
  const [bio, setBio] = useState(meProfile.bio || "");
  const [favDrinks, setFavDrinks] = useState<string[]>(meProfile.favorites || []);

  const addFav = () => setFavDrinks((prev) => [...prev, "Negroni"]);
  const removeFav = (name: string) => setFavDrinks((prev) => prev.filter((x) => x !== name));

  const usernameValid = USERNAME_RE.test(username);
  const displayNameValid = displayName.trim().length >= 1 && displayName.trim().length <= 50;
  const bioValid = bio.length <= 160;

  const formValid = usernameValid && displayNameValid && bioValid;

  const onSave = () => {
    if (!formValid) return;

    // demo: update mock store (no backend)
    profiles[me] = {
      ...profiles[me],
      name: displayName.trim(),
      bio,
      favorites: favDrinks,
    };

    Alert.alert("Saved", "Your profile changes were saved (demo).");
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Image source={{ uri: meProfile.avatarUrl || "https://i.pravatar.cc/150?img=12" }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraBadge} onPress={() => {/* TODO: image picker */}}>
            <Text style={styles.cameraBadgeText}>📷</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your public info</Text>
        </View>
      </View>

      {/* Profile form */}
      <View style={styles.card}>
        <LabeledField label="Display Name">
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            maxLength={50}
          />
          {!displayNameValid && <FieldHint>Display name is required (max 50 chars).</FieldHint>}
        </LabeledField>

        <LabeledField label="Username (public handle, optional)">
          <TextInput
            value={username}
            onChangeText={(v) => setUsername(v.toLowerCase())}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="username"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            maxLength={20}
          />
          {!usernameValid && (
            <FieldHint>3–20 chars, lowercase letters, numbers, or “_”; no leading/trailing “_”.</FieldHint>
          )}
        </LabeledField>

        <LabeledField label="Bio">
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people your taste…"
            placeholderTextColor={Colors.textSecondary}
            style={[styles.input, styles.inputMultiline]}
            multiline
            maxLength={160}
          />
          <Text style={styles.counter}>{bio.length}/160</Text>
        </LabeledField>
      </View>

      {/* Favorites */}
      <View style={styles.card}>
        <View style={styles.rowSpace}>
          <Text style={styles.cardTitle}>Favorite Drinks</Text>
          <TouchableOpacity onPress={addFav}>
            <Text style={styles.link}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipsWrap}>
          {favDrinks.length === 0 && <Text style={styles.emptyText}>Nothing yet—add a few favorites.</Text>}
          {favDrinks.map((d) => (
            <Chip key={d} text={d} onRemove={() => removeFav(d)} />
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={{ marginTop: 16, gap: 10 }}>
        <FormButton title="Save Changes" onPress={onSave} disabled={!formValid} />
        <FormButton title="Cancel" variant="danger" onPress={() => router.back()} />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

/* small internals */
function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}
function FieldHint({ children }: { children: React.ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}
function Chip({ text, onRemove }: { text: string; onRemove?: () => void }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{text}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.chipClose}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerTextWrap: { marginLeft: 12, flex: 1 },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: "700" },
  subtitle: { color: Colors.textSecondary, marginTop: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.surface },
  cameraBadge: {
    position: "absolute",
    right: -2, bottom: -2, backgroundColor: Colors.deepAsh,
    width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center",
  },
  cameraBadgeText: { color: "#fff", fontSize: 13 },

  card: { backgroundColor: Colors.buttonBackground, borderRadius: 16, padding: 14, marginTop: 12 },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700" },

  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12,
    color: Colors.nightBlack, fontSize: 15,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  counter: { color: Colors.textSecondary, marginTop: 6, alignSelf: "flex-end", fontSize: 12 },

  rowSpace: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { color: Colors.textSecondary, fontWeight: "700" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.richCharcoal, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { color: Colors.textPrimary, fontSize: 13, marginRight: 6 },
  chipClose: { color: Colors.textSecondary, fontSize: 12 },

  hint: { color: Colors.textSecondary, marginTop: 6, fontSize: 12 },
  emptyText: { color: Colors.textSecondary },

});
