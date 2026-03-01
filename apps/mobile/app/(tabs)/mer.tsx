import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import {
  Users,
  Building2,
  WifiOff,
  QrCode,
  HelpCircle,
  Info,
  ChevronRight,
  LogOut,
} from "lucide-react-native";
import { useAuth } from "../../src/providers/AuthProvider";

export default function MerSkjerm() {
  const { bruker, loggUt } = useAuth();

  const initialer = bruker?.name
    ? bruker.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Mer</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {/* Menyvalg */}
        <View className="mt-4">
          <MenyRad ikon={Users} tekst="Kontakter" />
          <MenyRad ikon={Building2} tekst="Grupper" />
          <MenyRad ikon={WifiOff} tekst="Forbered til offline" />
          <MenyRad ikon={QrCode} tekst="Skann QR-kode" />
          <MenyRad ikon={HelpCircle} tekst="Hjelp" />
          <MenyRad ikon={Info} tekst="Om" />
        </View>

        {/* Brukerprofil */}
        <View className="mx-4 mt-6 rounded-xl bg-white p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-siteflow-blue">
              <Text className="text-base font-bold text-white">
                {initialer}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {bruker?.name ?? "Ukjent bruker"}
              </Text>
              <Text className="text-sm text-gray-500">
                {bruker?.email ?? ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Logg ut */}
        <View className="mx-4 mt-6">
          <Pressable
            onPress={loggUt}
            className="items-center rounded-lg bg-red-50 py-3 active:bg-red-100"
          >
            <View className="flex-row items-center gap-2">
              <LogOut size={18} color="#ef4444" />
              <Text className="text-base font-medium text-red-600">
                Logg ut
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenyRad({
  ikon: Ikon,
  tekst,
}: {
  ikon: LucideIcon;
  tekst: string;
}) {
  return (
    <Pressable className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5 active:bg-gray-50">
      <View className="flex-row items-center gap-3">
        <Ikon size={20} color="#6b7280" />
        <Text className="text-base text-gray-900">{tekst}</Text>
      </View>
      <ChevronRight size={18} color="#d1d5db" />
    </Pressable>
  );
}
