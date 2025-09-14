import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import FormButton from "@/components/ui/FormButton";
import BottomNav from "@/components/ui/BottomNav";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cocktail Mixology</Text>
        <Text style={styles.subtitle}>Welcome! Choose a section:</Text>

      <FormButton
        title="Scan Ingredients"
        onPress={() => router.push("/screens/ingredient-scanner")}
      />

      <FormButton
        title="My Cabinet"
        onPress={() => router.push("/screens/my-ingredients")}
      />

      <FormButton
        title="Recommendations"
        onPress={() => router.push("/screens/recommendations")}
      />

      <FormButton
        title="Profile"
        onPress={() => router.push("/screens/user-profile")}
      />

      <FormButton
        title="Settings"
        onPress={() => router.push("/(settings)/settings")}
      />
      </View>

      {/* floating dock */}
      <View style={styles.dock}>
        <BottomNav
          activeIndex={0}
          safeArea={false}
          items={[
            { icon: "home-outline" }, // home
            { icon: "heart-outline" }, //   favorites
            { icon: "search-outline" }, //  search/browse
            { icon: "cube-outline", route: "/screens/my-ingredients" }, // Cabinet
            { icon: "person-outline", route: "/screens/user-profile" },  // Profile
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101010" },
  content: {
    flex: 1,
    padding: 20,
    gap: 12,
    justifyContent: "center",
    paddingBottom: 120,
  },
  dock: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 18,
  },
  title: { color: "#F5F0E1", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { color: "#D9D4C5", fontSize: 16, textAlign: "center", marginBottom: 16 },
});
