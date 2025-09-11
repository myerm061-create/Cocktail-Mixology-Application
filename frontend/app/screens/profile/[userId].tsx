import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import FormButton from "@/components/ui/FormButton";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  // TODO: replace with fetch(`/api/users/${userId}`)
  const me = "curtis"; // from auth
  const isMe = userId === me;

  const profile = {
    id: userId ?? "unknown",
    name: "Bob",
    bio: "Home mixologist. Loves citrus + whiskey.",
    favorites: ["Whiskey Sour", "Mojito", "Espresso Martini", "Negroni"],
    sharedRecipes: [
      { id: "1", name: "Smoked Old Fashioned", likes: 42 },
      { id: "2", name: "Yuzu Gin Fizz", likes: 31 },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Image source={{ uri: "https://i.pravatar.cc/150?img=12" }} style={styles.avatar} />
        <Text style={styles.name}>{profile.name}</Text>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {isMe ? (
          <FormButton
            title="Edit Profile"
            onPress={() => router.push("/(tabs)/screens/user-profile/edit")}
            style={{ marginTop: 10, width: 160 }}
            textStyle={{ fontSize: 14 }}
          />
        ) : (
          <FormButton
            title="Follow"
            onPress={() => {/* follow logic */}}
            style={{ marginTop: 10, width: 160 }}
            textStyle={{ fontSize: 14 }}
          />
        )}
      </View>

      {/* Favorites */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Favorite Drinks</Text>
        <View style={styles.chipsWrap}>
          {profile.favorites.map((d) => (
            <View key={d} style={styles.chip}><Text style={styles.chipText}>{d}</Text></View>
          ))}
        </View>
      </View>

      {/* Shared recipes */}
      <View style={styles.card}>
        <View style={styles.rowSpace}>
          <Text style={styles.sectionTitle}>Shared Recipes</Text>
          <TouchableOpacity onPress={() => {/* navigate to list */}}>
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
              <TouchableOpacity onPress={() => {/* open recipe */}}>
                <Text style={styles.link}>Open</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: "center", marginBottom: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.surface },
  name: { color: Colors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: 10 },
  bio: { color: Colors.textSecondary, marginTop: 6, textAlign: "center" },
  card: { backgroundColor: Colors.buttonBackground, borderRadius: 16, padding: 14, marginTop: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { backgroundColor: Colors.richCharcoal, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { color: Colors.textPrimary, fontSize: 13 },
  rowSpace: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  link: { color: Colors.textSecondary, fontWeight: "700" },
  recipeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  recipeName: { color: Colors.textPrimary, fontSize: 15, fontWeight: "600" },
  recipeMeta: { color: Colors.textSecondary, marginTop: 2, fontSize: 12 },
});