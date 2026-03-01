import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";

// Dynamisk import av react-native-maps (ikke tilgjengelig i Expo Go)
let MapView: React.ComponentType<Record<string, unknown>> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const maps = require("react-native-maps");
  MapView = maps.default;
} catch {
  // react-native-maps ikke tilgjengelig (Expo Go)
}

// Fallback: Oslo sentrum
const STANDARD_REGION = {
  latitude: 59.91,
  longitude: 10.75,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function KartVisning() {
  const [region, setRegion] = useState(STANDARD_REGION);
  const [laster, setLaster] = useState(true);

  useEffect(() => {
    let avbrutt = false;

    async function hentPosisjon() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLaster(false);
          return;
        }

        const posisjon = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!avbrutt) {
          setRegion({
            latitude: posisjon.coords.latitude,
            longitude: posisjon.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      } catch {
        // Bruk standard region ved feil
      } finally {
        if (!avbrutt) {
          setLaster(false);
        }
      }
    }

    hentPosisjon();

    return () => {
      avbrutt = true;
    };
  }, []);

  if (laster) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#1e40af" />
        <Text className="mt-3 text-sm text-gray-500">Henter posisjon…</Text>
      </View>
    );
  }

  // Fallback når react-native-maps ikke er tilgjengelig (Expo Go)
  if (!MapView) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <MapPin size={48} color="#15803d" />
        <Text className="mt-4 text-base font-medium text-gray-700">
          Kartvisning
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
        <Text className="mt-4 px-8 text-center text-xs text-gray-400">
          Kart krever development build. Bruk EAS Build for full kartvisning.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      mapType="satellite"
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton
    />
  );
}
