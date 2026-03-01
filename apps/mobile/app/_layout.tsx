import "../src/global.css";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Providers } from "../src/providers";

export default function RotLayout() {
  return (
    <Providers>
      <StatusBar style="light" />
      <Slot />
    </Providers>
  );
}
