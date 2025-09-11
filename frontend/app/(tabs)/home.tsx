import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cocktail Mixology</Text>
      <Text style={styles.subtitle}>Welcome! Choose a section:</Text>

      <Pressable style={styles.btn} onPress={() => router.push("/screens/ingredient-scanner")}>
        <Text style={styles.btnText}>Scan Ingredients</Text>
      </Pressable>

      <Pressable style={styles.btn} onPress={() => router.push("/screens/my-ingredients")}>
        <Text style={styles.btnText}>My Cabinet</Text>
      </Pressable>

      <Pressable style={styles.btn} onPress={() => router.push("/screens/recommendations")}>
        <Text style={styles.btnText}>Recommendations</Text>
      </Pressable>

      <Pressable style={styles.btn} onPress={() => router.push("/screens/profile/user")}>
        <Text style={styles.btnText}>Profile</Text>
      </Pressable>

      <Pressable style={styles.btn} onPress={() => router.push("/screens/settings")}>
        <Text style={styles.btnText}>Settings</Text>
      </Pressable>
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
