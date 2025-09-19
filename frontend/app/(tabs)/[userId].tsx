import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";import { useLocalSearchParams, router } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import FormButton from "@/components/ui/FormButton";
import BackButton from "@/components/ui/BackButton";
import { getProfile, profiles, ME_ID, type Profile } from "@/scripts/data/mockProfiles";

// User profile screen, shows info for userId in params or self if none
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  // Normalize param to a single string
  const params = useLocalSearchParams<{ userId?: string | string[] }>();
  const rawParam = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  // Normalize both sides to string to avoid "1" !== 1
  const me = String(ME_ID);
  const userId = rawParam ? String(rawParam) : me;

  const viewingSelf = userId === me;

  const profile: Profile = useMemo(() => getProfile(userId), [userId]);

  // local demo state
  const initiallyFriends = useMemo(() => {
    const myFriends = profiles[me]?.friends ?? [];
    return myFriends.some((f) => String(f.id) === userId);
  }, [me, userId]);

  const [isFriend, setIsFriend] = useState(initiallyFriends);
  const [viewAsPublic, setViewAsPublic] = useState(false);

  // Reset toggles when switching profiles
  useEffect(() => {
    setViewAsPublic(false);
    setIsFriend(initiallyFriends);
  }, [userId, initiallyFriends]);

  const showEditForSelf = viewingSelf && !viewAsPublic;
  const showAddFriend = !viewingSelf;

  return (
    <View style={styles.screen}>
      {/* Top-left back button overlay */}
      <View style={styles.backWrap}>
        <BackButton />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56, flexGrow: 1 }, // match Settings
        ]}
        showsVerticalScrollIndicator={false}
      >        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: profile.avatarUrl || "https://i.pravatar.cc/150" }} style={styles.avatar} />
          <Text style={styles.name}>{profile.name}</Text>
          {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          {showEditForSelf && (
            <FormButton
              title="Edit Profile"
              onPress={() => router.push("../edit")}
              style={{ marginTop: 10, width: 160 }}
              textStyle={{ fontSize: 14 }}
            />
          )}

          {viewingSelf && (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>View as public</Text>
              <Switch
                value={viewAsPublic}
                onValueChange={setViewAsPublic}
                trackColor={{ false: Colors.textSecondary, true: Colors.textSecondary }}
                thumbColor={Colors.textPrimary}
                ios_backgroundColor={Colors.textSecondary}
              />
            </View>
          )}

          {showAddFriend && (
            <FormButton
              title={isFriend ? "Friends ✓" : "Add Friend"}
              onPress={() => setIsFriend(true)}
              style={{ marginTop: 10, width: 160 }}
              textStyle={{ fontSize: 14 }}
            />
          )}
        </View>

        {/* Friends */}
        <View style={styles.card}>
          <View style={styles.rowSpace}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.link}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10 }}>
            {profile.friends.length === 0 ? (
              <Text style={{ color: Colors.textSecondary }}>No friends yet.</Text>
            ) : (
              profile.friends.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={styles.friendRow}
                  onPress={() => router.push("../" + String(f.id))}
                >
                  <Image
                    source={{ uri: f.avatarUrl || "https://i.pravatar.cc/150?img=8" }}
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{f.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Favorite Drinks</Text>
          <View style={styles.chipsWrap}>
            {profile.favorites.map((d) => (
              <View key={d} style={styles.chip}>
                <Text style={styles.chipText}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Shared recipes */}
        <View style={styles.card}>
          <View style={styles.rowSpace}>
            <Text style={styles.sectionTitle}>Shared Recipes</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.link}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 10 }}>
            {profile.sharedRecipes.map((r) => (
              <View key={r.id} style={styles.recipeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recipeName}>{r.name}</Text>
                  <Text style={styles.recipeMeta}>♥ {r.likes}</Text>
                </View>
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.link}>Open</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  backWrap: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
  },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 44 },
  header: { alignItems: "center", marginBottom: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.surface },
  name: { color: Colors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: 10 },
  bio: { color: Colors.textSecondary, marginTop: 6, textAlign: "center" },

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  toggleLabel: { color: Colors.textSecondary },

  card: { backgroundColor: Colors.buttonBackground, borderRadius: 16, padding: 14, marginTop: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700" },
  rowSpace: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { backgroundColor: Colors.richCharcoal, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { color: Colors.textPrimary, fontSize: 13 },

  link: { color: Colors.textSecondary, fontWeight: "700" },

  recipeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  recipeName: { color: Colors.textPrimary, fontSize: 15, fontWeight: "600" },
  recipeMeta: { color: Colors.textSecondary, marginTop: 2, fontSize: 12 },

  friendRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  friendAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface },
  friendName: { color: Colors.textPrimary, fontSize: 14, fontWeight: "600" },
});
