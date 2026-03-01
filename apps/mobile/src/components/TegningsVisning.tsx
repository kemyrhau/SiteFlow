import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import type { GestureResponderEvent, LayoutChangeEvent } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { X, MapPin } from "lucide-react-native";

export interface Markør {
  x: number;
  y: number;
  id: string;
}

interface TegningsVisningProps {
  tegningUrl: string;
  tegningNavn: string;
  onLukk: () => void;
  onTrykk?: (posX: number, posY: number) => void;
  markører?: Markør[];
}

function erPdf(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

export function TegningsVisning({
  tegningUrl,
  tegningNavn,
  onLukk,
  onTrykk,
  markører = [],
}: TegningsVisningProps) {
  const [laster, setLaster] = useState(true);
  const { width, height } = useWindowDimensions();
  const erPdfFil = erPdf(tegningUrl);
  const [bildeDimensjoner, setBildeDimensjoner] = useState({ width: 0, height: 0 });

  // For bildevisning: beregn faktisk bildeposisjon innenfor "contain"-boks
  const bildeRef = useRef<View>(null);

  const håndterBildeLayout = useCallback((e: LayoutChangeEvent) => {
    setBildeDimensjoner({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  }, []);

  // Håndter trykk på bildeområdet
  const håndterBildeTrykk = useCallback(
    (e: GestureResponderEvent) => {
      if (!onTrykk) return;

      const { locationX, locationY } = e.nativeEvent;
      const containerW = bildeDimensjoner.width || width;
      const containerH = bildeDimensjoner.height || height * 0.8;

      // Beregn prosent av synlig bildeflate
      const posX = (locationX / containerW) * 100;
      const posY = (locationY / containerH) * 100;

      // Begrens til 0-100
      const klampX = Math.max(0, Math.min(100, posX));
      const klampY = Math.max(0, Math.min(100, posY));

      onTrykk(klampX, klampY);
    },
    [onTrykk, bildeDimensjoner, width, height],
  );

  // Håndter trykk fra PDF WebView via postMessage
  const håndterWebViewMelding = useCallback(
    (e: WebViewMessageEvent) => {
      if (!onTrykk) return;
      try {
        const data = JSON.parse(e.nativeEvent.data);
        if (data.type === "trykk" && typeof data.x === "number" && typeof data.y === "number") {
          onTrykk(data.x, data.y);
        }
      } catch {
        // Ignorer ugyldig melding
      }
    },
    [onTrykk],
  );

  // JavaScript som injiseres i WebView for å fange klikk
  const injisertJs = `
    (function() {
      document.addEventListener('click', function(e) {
        var x = (e.clientX / window.innerWidth) * 100;
        var y = (e.clientY / window.innerHeight) * 100;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'trykk', x: x, y: y }));
      });
    })();
    true;
  `;

  // Render markører som absolutt posisjonerte pinner
  const renderMarkører = (containerW: number, containerH: number) => {
    return markører.map((m) => (
      <View
        key={m.id}
        pointerEvents="none"
        style={{
          position: "absolute",
          left: (m.x / 100) * containerW - 12,
          top: (m.y / 100) * containerH - 24,
          zIndex: 20,
        }}
      >
        <MapPin size={24} color="#ef4444" fill="#ef4444" />
      </View>
    ));
  };

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
        <View style={{ width: 36 }} />
      </View>

      {/* Innhold: PDF via WebView eller bilde med zoom/pan */}
      {erPdfFil ? (
        <View className="flex-1 pt-12">
          {laster && (
            <View className="absolute inset-0 z-0 items-center justify-center">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="mt-3 text-sm text-gray-300">
                Laster tegning…
              </Text>
            </View>
          )}
          {Platform.OS === "web" ? (
            <View style={{ flex: 1, position: "relative" }}>
              <iframe
                src={tegningUrl}
                style={{ flex: 1, width: "100%", height: "100%", border: "none" }}
                onLoad={() => setLaster(false)}
              />
              {/* Transparent overlegg for å fange klikk på web */}
              {onTrykk && (
                <Pressable
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  onPress={(e) => {
                    const { locationX, locationY } = e.nativeEvent;
                    const posX = (locationX / width) * 100;
                    const posY = (locationY / (height * 0.8)) * 100;
                    onTrykk(
                      Math.max(0, Math.min(100, posX)),
                      Math.max(0, Math.min(100, posY)),
                    );
                  }}
                >
                  {renderMarkører(width, height * 0.8)}
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ flex: 1, position: "relative" }}>
              <WebView
                source={{ uri: tegningUrl }}
                style={{ flex: 1 }}
                onLoadEnd={() => setLaster(false)}
                scalesPageToFit
                injectedJavaScript={onTrykk ? injisertJs : undefined}
                onMessage={håndterWebViewMelding}
              />
              {renderMarkører(width, height * 0.8)}
            </View>
          )}
        </View>
      ) : (
        <View
          ref={bildeRef}
          onLayout={håndterBildeLayout}
          style={{ flex: 1, position: "relative" }}
        >
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
            <Pressable onPress={håndterBildeTrykk}>
              <Image
                source={{ uri: tegningUrl }}
                style={{ width, height: height * 0.8 }}
                resizeMode="contain"
                onLoadEnd={() => setLaster(false)}
              />
              {/* Markører over bildet */}
              {renderMarkører(width, height * 0.8)}
            </Pressable>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
