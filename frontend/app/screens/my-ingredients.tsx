import { View, Text, StyleSheet } from "react-native";

export default function MyIngredientsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cabinet</Text>
      <Text>Your saved ingredients will appear here.</Text>
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
