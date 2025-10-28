import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Link } from "expo-router";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import FormButton from "@/components/ui/FormButton";

const { width, height } = Dimensions.get("window");

// Prefer local assets for instant render (no flicker). Put these under /assets/onboarding/.
const SLIDES = [
  {
    key: "discover",
    title: "Discover Cocktails",
    subtitle: "Search by name or ingredient",
    // image: { uri: "https://..." }, // remote alternative
    // image: require("@/assets/onboarding/discover.jpg"),
  },
  {
    key: "cabinet",
    title: "Build Your Cabinet",
    subtitle: "Save what you own & get matches",
    // image: require("@/assets/onboarding/cabinet.jpg"),
  },
  {
    key: "favorites",
    title: "Pin Favorites",
    subtitle: "Quick access to go-to drinks",
    //image: require("@/assets/onboarding/favorites.jpg"),
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const listRef = useRef<Animated.FlatList<any>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // If they’ve already onboarded, bounce them right away.
  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem("hasOnboarded");
      if (seen === "1") router.replace("/(auth)/create-account"); // or /home if already signed-in
    })();
  }, []);

  // (Optional) Preload remote images if you stick with URLs:
  // useEffect(() => {
  //   SLIDES.forEach(s => { if ("uri" in (s.image as any)) Image.prefetch((s.image as any).uri); });
  // }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length) {
      const i = viewableItems[0].index ?? 0;
      setIndex(i);
    }
  }).current;

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      void done();
    }
  };

  const done = async () => {
    try { await AsyncStorage.setItem("hasOnboarded", "1"); } catch {}
    router.replace("/(auth)/create-account");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={done} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <ImageBackground source={item.image as any} resizeMode="cover" style={styles.bg}>
              <LinearGradient
                colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.85)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </ImageBackground>
          </View>
        )}
      />

      {/* Animated Dots / Paddle */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const widthAnim = scrollX.interpolate({
            inputRange,
            outputRange: [8, 22, 8],
            extrapolate: "clamp",
          });
          const opacityAnim = scrollX.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: widthAnim,
                  opacity: opacityAnim,
                },
              ]}
            />
          );
        })}
      </View>

      {/* CTAs */}
      <View style={styles.ctaWrap}>
        <FormButton
          title={index === SLIDES.length - 1 ? "Get Started" : "Next"}
          onPress={next}
        />
        <Text style={styles.haveAcct}>
          Already have an account?{" "}
          <Link href="/(auth)/login" asChild>
            <Text style={styles.link}>Sign in</Text>
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bg: { flex: 1, justifyContent: "flex-end" },
  topBar: { position: "absolute", top: 8, right: 16, zIndex: 10 },
  skip: { color: Colors.textSecondary, fontSize: 14 },
  content: { padding: 24, paddingBottom: 140 },
  title: { color: Colors.textPrimary, fontSize: 30, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: Colors.textSecondary, fontSize: 16 },

  // Dots row
  dots: {
    position: "absolute",
    bottom: 108,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#fff",
    opacity: 0.35,
  },

  // Bottom CTAs
  ctaWrap: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: "center",
    gap: 12,
  },
  haveAcct: { color: Colors.textSecondary, fontSize: 14 },
  link: { color: Colors.link, fontSize: 14 },
});
