import { View, Text, StyleSheet } from "react-native";

export default function IngredientScannerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Ingredients</Text>
      <Text>Add ingredient scanner functionality here.</Text>
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
