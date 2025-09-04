import { View, Text, StyleSheet } from "react-native";

export default function UserProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile & Settings</Text>
      <Text>User info and settings go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#101010",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F5F0E1",
    marginBottom: 12,
  },
});
