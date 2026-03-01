import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

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
