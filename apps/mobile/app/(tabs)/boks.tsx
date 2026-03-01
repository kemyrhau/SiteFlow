import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FolderOpen } from "lucide-react-native";

export default function BoksSkjerm() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Box</Text>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <FolderOpen size={48} color="#9ca3af" />
        <Text className="mt-4 text-base font-medium text-gray-500">
          Dokumenter og filer
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-400">
          Filstruktur og dokumenthåndtering kommer i Fase 7
        </Text>
      </View>
    </SafeAreaView>
  );
}
