import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LiquidBackground from "./LiquidBackground";
import Colors from "../constants/theme";

/**
 * ScreenContainer provides:
 * 1. Multi-layered Liquid Ocean ambient background with drifting orbs
 * 2. iOS-style smooth entry transition (gentle scale 0.985 -> 1, fade 0 -> 1, slide 14 -> 0)
 * 3. Platform safe area & floating dock spacing management
 */
export default function ScreenContainer({ children, style, noBackground = false }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  const scaleAnim = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 340,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <View style={[styles.root, noBackground && { backgroundColor: "transparent" }]}>
      {/* Layered Liquid Background with Ambient Floating Orbs */}
      {!noBackground && <LiquidBackground />}

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 34 : 0,
  },
  animatedContent: {
    flex: 1,
  },
});
