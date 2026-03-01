import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin } from "lucide-react-native";

export default function LokasjonerSkjerm() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Lokasjoner</Text>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <MapPin size={48} color="#9ca3af" />
        <Text className="mt-4 text-base font-medium text-gray-500">
          Lokasjoner
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-400">
          Kart- og tegningsvisning kommer i Fase 6
        </Text>
      </View>
    </SafeAreaView>
  );
}
