import { View, Text, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../src/providers/AuthProvider";

export default function LoggInnSkjerm() {
  const { loggInnMedGoogle, loggInnMedMicrosoft, laster } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="mb-12 items-center">
          <Text className="text-4xl font-bold text-siteflow-blue">
            SiteFlow
          </Text>
          <Text className="mt-2 text-base text-gray-500">
            Rapport- og kvalitetsstyring
          </Text>
        </View>

        {/* Innloggingsknapper */}
        <View className="w-full gap-4">
          <Pressable
            onPress={loggInnMedGoogle}
            disabled={laster}
            className="flex-row items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-4 active:bg-gray-50"
          >
            <Text className="text-base font-medium text-gray-700">
              Logg inn med Google
            </Text>
          </Pressable>

          <Pressable
            onPress={loggInnMedMicrosoft}
            disabled={laster}
            className="flex-row items-center justify-center rounded-lg bg-[#2f2f2f] px-6 py-4 active:bg-[#1a1a1a]"
          >
            <Text className="text-base font-medium text-white">
              Logg inn med Microsoft 365
            </Text>
          </Pressable>
        </View>

        {laster && (
          <Text className="mt-4 text-sm text-gray-400">Logger inn...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
