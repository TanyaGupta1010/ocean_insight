import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TelemetryProvider } from "../services/TelemetryContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <TelemetryProvider>
        <Stack screenOptions={{ headerShown: false, animation: "none" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="water-quality" />
          <Stack.Screen name="trends" />
          <Stack.Screen name="device" />
        </Stack>
      </TelemetryProvider>
    </SafeAreaProvider>
  );
}
