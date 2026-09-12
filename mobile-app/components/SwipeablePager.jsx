import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import LiquidBackground from "./LiquidBackground";
import FloatingTabBar from "./FloatingTabBar";
import OverviewScreen from "../screens/OverviewScreen";
import WaterQualityScreen from "../screens/WaterQualityScreen";
import TrendsScreen from "../screens/TrendsScreen";
import DeviceScreen from "../screens/DeviceScreen";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * SwipeablePager — Interactive Paged iOS Navigation Layer
 * Features:
 * - Continuous horizontal swipe gesture navigation
 * - Interactive real-time drag tracking
 * - Bottom tab indicator continuously interpolated from scrollX
 * - Tap-to-tab smooth sliding with spring momentum
 * - Single persistent LiquidBackground across all screens
 * - Zero remount flash or state loss
 */
export default function SwipeablePager({ initialPage = 0 }) {
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(initialPage * SCREEN_WIDTH)).current;
  const [activeIndex, setActiveIndex] = useState(initialPage);
  const isInitialScrollDone = useRef(false);

  // Scroll to initial page on mount if initialPage > 0
  useEffect(() => {
    if (initialPage > 0 && !isInitialScrollDone.current) {
      isInitialScrollDone.current = true;
      // Slight timeout to let layout complete
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialPage * SCREEN_WIDTH,
          animated: false,
        });
      }, 50);
    }
  }, [initialPage]);

  // Handle tap on floating tab bar
  const handleTabPress = useCallback((index) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  }, []);

  // Update active index when swipe momentum finishes
  const handleMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    const clampedPage = Math.max(0, Math.min(3, page));
    setActiveIndex(clampedPage);
  };

  return (
    <View style={styles.rootContainer}>
      {/* 1. Single Persistent Layered Ocean Liquid Background */}
      <LiquidBackground />

      {/* 2. Horizontal Animated ScrollView Pager */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        directionalLockEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.pagerScrollView}
        contentContainerStyle={styles.pagerContent}
      >
        {/* Page 0: Overview */}
        <View style={styles.pageItem}>
          <OverviewScreen
            noBackground={true}
            onNavigateToDevice={() => handleTabPress(3)}
          />
        </View>

        {/* Page 1: Water Quality */}
        <View style={styles.pageItem}>
          <WaterQualityScreen noBackground={true} />
        </View>

        {/* Page 2: Trends */}
        <View style={styles.pageItem}>
          <TrendsScreen noBackground={true} />
        </View>

        {/* Page 3: Device */}
        <View style={styles.pageItem}>
          <DeviceScreen noBackground={true} />
        </View>
      </Animated.ScrollView>

      {/* 3. Bottom Floating Liquid Glass Tab Bar */}
      <FloatingTabBar
        scrollX={scrollX}
        currentIndex={activeIndex}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F4F8FA",
    position: "relative",
  },
  pagerScrollView: {
    flex: 1,
  },
  pagerContent: {
    flexDirection: "row",
  },
  pageItem: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
});
