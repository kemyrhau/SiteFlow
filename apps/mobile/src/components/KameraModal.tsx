import { useRef, useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, Modal, Animated } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ScreenOrientation from "expo-screen-orientation";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KameraModalProps {
  synlig: boolean;
  onBilde: (uri: string) => void;
  onLukk: () => void;
}

const ZOOM_NIVÅER = [
  { label: "0.5x", verdi: 0 },
  { label: "1x", verdi: 0.05 },
  { label: "3x", verdi: 0.15 },
] as const;

const MAL_FORHOLD = 5 / 4; // bredde:høyde

export function KameraModal({ synlig, onBilde, onLukk }: KameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const [tillatelse, spørOmTillatelse] = useCameraPermissions();
  const tarBilde = useRef(false);
  const [antallTatt, settAntallTatt] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [kameraLayout, setKameraLayout] = useState({ bredde: 0, hoyde: 0 });
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Lås til landskapsmodus når kameraet åpnes, tilbake til portrett ved lukking
  useEffect(() => {
    if (synlig) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [synlig]);

  const håndterTaBilde = useCallback(async () => {
    if (tarBilde.current || !cameraRef.current) return;
    tarBilde.current = true;
    try {
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();

      const foto = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: true,
      });
      if (foto?.uri) {
        settAntallTatt((n) => n + 1);
        onBilde(foto.uri);
      }
    } finally {
      tarBilde.current = false;
    }
  }, [onBilde, flashOpacity]);

  const håndterLukk = useCallback(() => {
    settAntallTatt(0);
    setZoom(0);
    onLukk();
  }, [onLukk]);

  // Beregn 5:4 crop-guide basert på kameravisningens faktiske layout
  // I landskapsmodus: bredde > høyde, overlay på venstre/høyre side
  const { bredde, hoyde } = kameraLayout;
  let overlayTopp = 0;
  let overlaySide = 0;
  if (bredde > 0 && hoyde > 0) {
    const visningsForhold = bredde / hoyde;
    if (visningsForhold >= MAL_FORHOLD) {
      // Bredere enn 5:4 — crop sidene
      const cropBredde = hoyde * MAL_FORHOLD;
      overlaySide = Math.max(0, (bredde - cropBredde) / 2);
    } else {
      // Smalere enn 5:4 — crop topp/bunn
      const cropHoyde = bredde / MAL_FORHOLD;
      overlayTopp = Math.max(0, (hoyde - cropHoyde) / 2);
    }
  }

  if (!synlig) return null;

  if (!tillatelse?.granted) {
    return (
      <Modal visible animationType="slide" presentationStyle="fullScreen">
        <View className="flex-1 items-center justify-center bg-black" style={{ paddingTop: insets.top }}>
          <Text className="mb-4 text-base text-white">Kameratilgang kreves</Text>
          <Pressable
            onPress={spørOmTillatelse}
            className="rounded-lg bg-blue-600 px-6 py-3"
          >
            <Text className="font-medium text-white">Gi tilgang</Text>
          </Pressable>
          <Pressable onPress={håndterLukk} className="mt-4 px-6 py-3">
            <Text className="text-gray-400">Avbryt</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
          zoom={zoom}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setKameraLayout((prev) =>
              prev.bredde === width && prev.hoyde === height
                ? prev
                : { bredde: width, hoyde: height },
            );
          }}
        >
          {/* 5:4 crop-guide — mørke overlay */}
          {overlayTopp > 0 && (
            <>
              <View
                pointerEvents="none"
                style={{ position: "absolute", top: 0, left: 0, right: 0, height: overlayTopp, backgroundColor: "rgba(0,0,0,0.5)" }}
              />
              <View
                pointerEvents="none"
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: overlayTopp, backgroundColor: "rgba(0,0,0,0.5)" }}
              />
              <View pointerEvents="none" style={{ position: "absolute", top: overlayTopp, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
              <View pointerEvents="none" style={{ position: "absolute", bottom: overlayTopp, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
            </>
          )}
          {overlaySide > 0 && (
            <>
              <View
                pointerEvents="none"
                style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: overlaySide, backgroundColor: "rgba(0,0,0,0.5)" }}
              />
              <View
                pointerEvents="none"
                style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: overlaySide, backgroundColor: "rgba(0,0,0,0.5)" }}
              />
              <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: overlaySide, width: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
              <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, right: overlaySide, width: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
            </>
          )}

          {/* Flash-overlay */}
          <Animated.View
            pointerEvents="none"
            style={{ ...({ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#ffffff" }), opacity: flashOpacity }}
          />

          {/* Lukk-knapp */}
          <Pressable
            onPress={håndterLukk}
            hitSlop={16}
            className="absolute left-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/50"
            style={{ top: insets.top + 8 }}
          >
            <X size={22} color="#ffffff" />
          </Pressable>

          {/* Bildeteller */}
          {antallTatt > 0 && (
            <View
              className="absolute right-4 z-10 rounded-full bg-blue-600 px-3 py-1.5"
              style={{ top: insets.top + 12 }}
            >
              <Text className="text-sm font-semibold text-white">{antallTatt}</Text>
            </View>
          )}
        </CameraView>

        {/* Zoomknapper + Utløserknapp */}
        <View
          className="items-center justify-center bg-black px-4"
          style={{ paddingBottom: insets.bottom + 4, paddingTop: 4 }}
        >
          {/* Zoomknapper */}
          <View className="mb-3 flex-row items-center gap-2">
            {ZOOM_NIVÅER.map((nivå) => {
              const erAktiv = zoom === nivå.verdi;
              return (
                <Pressable
                  key={nivå.label}
                  onPress={() => setZoom(nivå.verdi)}
                  className={`items-center justify-center rounded-full px-3 py-1 ${
                    erAktiv ? "bg-white" : "bg-white/20"
                  }`}
                  style={{ minWidth: 44, height: 30 }}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      erAktiv ? "text-black" : "text-white"
                    }`}
                  >
                    {nivå.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Utløserknapp */}
          <Pressable
            onPress={håndterTaBilde}
            className="h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white"
          >
            <View className="h-[58px] w-[58px] rounded-full bg-white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
