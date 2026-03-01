import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronRight, Plus } from "lucide-react-native";

export default function HjemSkjerm() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Grønn header med prosjektvelger */}
      <View className="flex-row items-center justify-between bg-siteflow-header px-4 py-3">
        <Pressable className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-green-300" />
          <Text className="text-lg font-semibold text-white">
            Velg prosjekt
          </Text>
          <ChevronDown size={20} color="#ffffff" />
        </Pressable>
        <Pressable className="rounded-full bg-white/20 p-2">
          <Plus size={20} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {/* Innboks-seksjon */}
        <Pressable className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-gray-900">
              Innboks
            </Text>
            <View className="rounded-full bg-gray-100 px-2 py-0.5">
              <Text className="text-xs font-medium text-gray-600">0</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </Pressable>

        {/* Tom innboks-melding */}
        <View className="border-b border-gray-200 bg-white px-4 py-6">
          <Text className="text-center text-sm text-gray-400">
            Ingen elementer i innboksen
          </Text>
        </View>

        {/* Seksjonslenker */}
        <View className="mt-4">
          <Pressable className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <Text className="text-base font-semibold text-gray-900">
              Sjekklister
            </Text>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <Text className="text-base font-semibold text-gray-900">
              Kontrollplaner
            </Text>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Sist oppdatert */}
        <View className="mt-6 px-4">
          <Text className="text-center text-xs text-gray-400">
            Velg et prosjekt for å se data
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
