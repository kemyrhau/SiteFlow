import { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, Image, Alert, Modal, ScrollView, InteractionManager } from "react-native";
import { Camera, Paperclip, Map, FileText, Trash2, Pencil } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { randomUUID } from "expo-crypto";
import type { Vedlegg } from "../../hooks/useSjekklisteSkjema";
import { taBilde, velgBilde } from "../../services/bilde";
import { lastOppFil } from "../../services/opplasting";
import { trpc } from "../../lib/trpc";
import { BildeAnnotering } from "../BildeAnnotering";
import { TegningsSkjermbilde } from "../TegningsSkjermbilde";
import { useProsjekt } from "../../kontekst/ProsjektKontekst";

interface FeltDokumentasjonProps {
  kommentar: string;
  vedlegg: Vedlegg[];
  onEndreKommentar: (kommentar: string) => void;
  onLeggTilVedlegg: (vedlegg: Vedlegg) => void;
  onFjernVedlegg: (vedleggId: string) => void;
  leseModus?: boolean;
  sjekklisteId: string;
  skjulKommentar?: boolean;
}

export function FeltDokumentasjon({
  kommentar,
  vedlegg,
  onEndreKommentar,
  onLeggTilVedlegg,
  onFjernVedlegg,
  leseModus,
  sjekklisteId,
  skjulKommentar,
}: FeltDokumentasjonProps) {
  const [lasterOpp, settLasterOpp] = useState(false);
  const [annoteringBilde, settAnnoteringBilde] = useState<string | null>(null);
  const [visTegningsModal, settVisTegningsModal] = useState(false);
  const [valgtVedleggId, settValgtVedleggId] = useState<string | null>(null);
  const { valgtProsjektId } = useProsjekt();

  const bildeOpprettMutasjon = trpc.bilde.opprettForSjekkliste.useMutation();

  const håndterBilde = useCallback(async (bildeUri: string, gpsLat?: number, gpsLng?: number) => {
    settLasterOpp(true);
    try {
      const filnavn = `IMG_${Date.now()}.jpg`;
      const opplastet = await lastOppFil(bildeUri, filnavn, "image/jpeg");

      // Legg til vedlegg i skjema umiddelbart
      onLeggTilVedlegg({
        id: randomUUID(),
        type: "bilde",
        url: opplastet.fileUrl,
        filnavn: opplastet.fileName,
      });

      // Lagre bildemetadata i bakgrunnen (ikke-blokkerende)
      bildeOpprettMutasjon.mutate({
        checklistId: sjekklisteId,
        fileUrl: opplastet.fileUrl,
        fileName: opplastet.fileName,
        fileSize: opplastet.fileSize,
        gpsLat,
        gpsLng,
        gpsEnabled: gpsLat != null,
      });
    } catch (e) {
      const melding = e instanceof Error ? e.message : "Ukjent feil";
      console.error("Bildeopplasting feilet:", melding);
      Alert.alert("Feil", `Kunne ikke laste opp bildet: ${melding}`);
    } finally {
      settLasterOpp(false);
    }
  }, [sjekklisteId, bildeOpprettMutasjon, onLeggTilVedlegg]);

  const håndterTaBilde = useCallback(async () => {
    const resultat = await taBilde();
    if (!resultat) return;
    // Vent til React Navigation har gjenopprettet tilstand etter kamera
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => resolve());
    });
    await håndterBilde(resultat.uri, resultat.gpsLat, resultat.gpsLng);
  }, [håndterBilde]);

  const håndterVelgBilde = useCallback(async () => {
    const resultat = await velgBilde();
    if (!resultat) return;
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => resolve());
    });
    await håndterBilde(resultat.uri, resultat.gpsLat, resultat.gpsLng);
  }, [håndterBilde]);

  const håndterVelgFil = useCallback(async () => {
    try {
      const resultat = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (resultat.canceled || !resultat.assets[0]) return;

      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => resolve());
      });

      const fil = resultat.assets[0];
      settLasterOpp(true);
      const opplastet = await lastOppFil(fil.uri, fil.name, fil.mimeType ?? "application/octet-stream");

      onLeggTilVedlegg({
        id: randomUUID(),
        type: "fil",
        url: opplastet.fileUrl,
        filnavn: opplastet.fileName,
      });
    } catch {
      Alert.alert("Feil", "Kunne ikke laste opp filen");
    } finally {
      settLasterOpp(false);
    }
  }, [onLeggTilVedlegg]);

  const håndterTegningsSkjermbilde = useCallback((bildeUri: string) => {
    settVisTegningsModal(false);
    håndterBilde(bildeUri);
  }, [håndterBilde]);

  const valgtVedlegg = vedlegg.find((v) => v.id === valgtVedleggId);

  const håndterSlett = useCallback(() => {
    if (!valgtVedleggId) return;
    onFjernVedlegg(valgtVedleggId);
    settValgtVedleggId(null);
  }, [valgtVedleggId, onFjernVedlegg]);

  const håndterAnnoter = useCallback(() => {
    if (!valgtVedlegg || valgtVedlegg.type !== "bilde") return;
    settAnnoteringBilde(valgtVedlegg.url);
  }, [valgtVedlegg]);

  return (
    <View className="mt-2 gap-2">
      {/* Kommentarfelt */}
      {!skjulKommentar && (
        <TextInput
          value={kommentar}
          onChangeText={onEndreKommentar}
          placeholder="Kommentar..."
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          editable={!leseModus}
          className={`rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 ${
            leseModus ? "text-gray-500" : ""
          }`}
        />
      )}

      {/* Verktøylinje (kun synlig når vedlegg er valgt) */}
      {!leseModus && valgtVedlegg && (
        <View className="flex-row gap-2">
          <Pressable
            onPress={håndterSlett}
            className="flex-row items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5"
          >
            <Trash2 size={14} color="#ef4444" />
            <Text className="text-xs font-medium text-red-600">Slett</Text>
          </Pressable>
          {valgtVedlegg.type === "bilde" && (
            <Pressable
              onPress={håndterAnnoter}
              className="flex-row items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5"
            >
              <Pencil size={14} color="#1e40af" />
              <Text className="text-xs font-medium text-blue-700">Annoter</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Filmrull — horisontal vedleggliste */}
      {vedlegg.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {vedlegg.map((v) => {
            const erValgt = v.id === valgtVedleggId;
            return (
              <Pressable
                key={v.id}
                onPress={() => {
                  if (leseModus) return;
                  settValgtVedleggId(erValgt ? null : v.id);
                }}
              >
                {v.type === "bilde" ? (
                  <Image
                    source={{ uri: v.url }}
                    className={`h-[72px] w-[72px] rounded-lg ${
                      erValgt ? "border-2 border-blue-500" : ""
                    }`}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className={`h-[72px] w-[72px] items-center justify-center rounded-lg bg-gray-100 ${
                      erValgt ? "border-2 border-blue-500" : ""
                    }`}
                  >
                    <FileText size={22} color="#6b7280" />
                    <Text className="mt-1 text-center text-[9px] text-gray-500" numberOfLines={1}>
                      {v.filnavn}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Handlingsknapper */}
      {!leseModus && (
        <View className="flex-row gap-2">
          <Pressable
            onPress={håndterTaBilde}
            disabled={lasterOpp}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white py-2"
          >
            <Camera size={16} color="#6b7280" />
            <Text className="text-xs text-gray-600">Ta bilde</Text>
          </Pressable>
          <Pressable
            onPress={håndterVelgFil}
            disabled={lasterOpp}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white py-2"
          >
            <Paperclip size={16} color="#6b7280" />
            <Text className="text-xs text-gray-600">Velg fil</Text>
          </Pressable>
          {valgtProsjektId && (
            <Pressable
              onPress={() => settVisTegningsModal(true)}
              disabled={lasterOpp}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white py-2"
            >
              <Map size={16} color="#6b7280" />
              <Text className="text-xs text-gray-600">Tegning</Text>
            </Pressable>
          )}
        </View>
      )}

      {lasterOpp && (
        <Text className="text-center text-xs text-gray-400">Laster opp...</Text>
      )}

      {/* Bildeannotering modal */}
      {annoteringBilde && (
        <Modal visible animationType="slide" presentationStyle="fullScreen">
          <BildeAnnotering
            bildeUri={annoteringBilde}
            onFerdig={async (annotert) => {
              settAnnoteringBilde(null);
              if (valgtVedleggId) {
                // Annoterer eksisterende bilde — erstatt med annotert versjon
                onFjernVedlegg(valgtVedleggId);
                settValgtVedleggId(null);
              }
              await håndterBilde(annotert);
            }}
            onAvbryt={() => {
              settAnnoteringBilde(null);
              settValgtVedleggId(null);
            }}
          />
        </Modal>
      )}

      {/* Tegnings-skjermbilde modal */}
      {visTegningsModal && valgtProsjektId && (
        <Modal visible animationType="slide" presentationStyle="fullScreen">
          <TegningsSkjermbilde
            prosjektId={valgtProsjektId}
            onFerdig={håndterTegningsSkjermbilde}
            onAvbryt={() => settVisTegningsModal(false)}
          />
        </Modal>
      )}
    </View>
  );
}
