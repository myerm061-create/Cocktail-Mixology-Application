import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import FormButton from "@/components/ui/FormButton";


export default function HomeScreen() {
  return (
    <View style={styles.container}>
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
        title="Search"
        onPress={() => router.push("/search")}
      />

      <FormButton
        title="Profile"
        onPress={() => router.push("/screens/profile/user")}
      />

      <FormButton
        title="Settings"
        onPress={() => router.push("/screens/settings")}
      />

      {/* Example: placeholder sign-out */}
      <FormButton
        title="Sign Out"
        variant="dangerLogo"
        onPress={() => {
          console.log("Sign out pressed");
          router.replace("/login");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101010", padding: 20, gap: 12, justifyContent: "center" },
  title: { color: "#F5F0E1", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { color: "#D9D4C5", fontSize: 16, textAlign: "center", marginBottom: 16 },
  btn: { backgroundColor: "#2A2A2A", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#F5F0E1", fontSize: 16, fontWeight: "600" },
});
