import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import Colors from "../constants/colors";

const { width } = Dimensions.get("window");

export default function AmbientOceanWaves() {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    );
    waveLoop.start();

    return () => waveLoop.stop();
  }, [waveAnim]);

  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  return (
    <View style={styles.waveContainer} pointerEvents="none">
      <Animated.View style={[styles.waveWrapper, { transform: [{ translateX }] }]}>
        <Svg width={width + 40} height="48" viewBox={`0 0 ${width + 40} 48`}>
          <Path
            d={`M 0 24 Q ${width * 0.25} 12, ${width * 0.5} 24 T ${width} 24 T ${width + 40} 24 L ${width + 40} 48 L 0 48 Z`}
            fill="rgba(2, 132, 199, 0.03)"
          />
          <Path
            d={`M 0 32 Q ${width * 0.3} 20, ${width * 0.6} 30 T ${width + 40} 32 L ${width + 40} 48 L 0 48 Z`}
            fill="rgba(6, 182, 212, 0.025)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    overflow: "hidden",
  },
  waveWrapper: {
    width: width + 40,
    height: 48,
  },
});
