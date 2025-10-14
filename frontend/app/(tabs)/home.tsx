import { Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { router } from "expo-router";
import FormButton from "@/components/ui/FormButton";
// import { ME_ID } from "@/scripts/data/mockProfiles";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Cocktail Mixology</Text>
        <Text style={styles.subtitle}>Welcome! Choose a section:</Text>

        {/* navigation buttons */}
        {/* <FormButton title="Scan Ingredients" onPress={() => router.push("/(stack)/ingredient-scanner")} /> */}
        <FormButton title="My Cabinet" onPress={() => router.push("/cabinet")} />
        {/* <FormButton title="Recommendations" onPress={() => router.push("/(stack)/recommendations")} /> */}
        <FormButton title="Favorites" onPress={() => router.push("/favorites")} />
        <FormButton title="Profile" onPress={() => router.push(`/profile`)} />
        <FormButton title="Search" onPress={() => router.push("/search")} />
        <FormButton title="Settings" onPress={() => router.push("/(stack)/settings")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101010" },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 120,
  },
  title: {
    color: "#F5F0E1",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#D9D4C5",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
});
