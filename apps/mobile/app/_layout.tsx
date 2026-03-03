import "../src/global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { Providers } from "../src/providers";

export default function RotLayout() {
  // Lås appen til portrett ved oppstart (app.json er "default" for å tillate programmatisk endring)
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <Providers>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="logg-inn" />
        <Stack.Screen name="sjekkliste" />
        <Stack.Screen name="oppgave" />
      </Stack>
    </Providers>
  );
}
