// frontend/app/index.tsx
import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Home</Text>
      <Link href="/search" style={{ fontSize: 18, textDecorationLine: "underline" }}>
        Go to Search
      </Link>
    </View>
  );
}