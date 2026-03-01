import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../src/providers/AuthProvider";

export default function Index() {
  const { erInnlogget, laster } = useAuth();

  if (laster) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (erInnlogget) {
    return <Redirect href="/(tabs)/hjem" />;
  }

  return <Redirect href="/logg-inn" />;
}
