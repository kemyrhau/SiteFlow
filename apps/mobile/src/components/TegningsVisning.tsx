import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { X } from "lucide-react-native";

interface TegningsVisningProps {
  tegningUrl: string;
  tegningNavn: string;
  onLukk: () => void;
}

export function TegningsVisning({
  tegningUrl,
  tegningNavn,
  onLukk,
}: TegningsVisningProps) {
  const [laster, setLaster] = useState(true);
  const { width, height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-black">
      {/* Header med tegningsnavn og lukk-knapp */}
      <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-between bg-black/60 px-4 py-3">
        <Pressable
          onPress={onLukk}
          hitSlop={12}
          className="rounded-full bg-white/20 p-2"
        >
          <X size={20} color="#ffffff" />
        </Pressable>
        <Text
          className="flex-1 px-3 text-center text-sm font-medium text-white"
          numberOfLines={1}
        >
          {tegningNavn}
        </Text>
        {/* Plasshodler for å balansere layouten */}
        <View style={{ width: 36 }} />
      </View>

      {/* Tegningsbilde med zoom/pan */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        maximumZoomScale={5}
        minimumZoomScale={1}
        bouncesZoom
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {laster && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="mt-3 text-sm text-gray-300">
              Laster tegning…
            </Text>
          </View>
        )}
        <Image
          source={{ uri: tegningUrl }}
          style={{ width, height: height * 0.8 }}
          resizeMode="contain"
          onLoadEnd={() => setLaster(false)}
        />
      </ScrollView>
    </View>
  );
}
