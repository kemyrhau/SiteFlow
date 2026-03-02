import { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import type { RapportObjektProps } from "./typer";

export function TekstfeltObjekt({ objekt, verdi, onEndreVerdi, leseModus }: RapportObjektProps) {
  const [visModal, settVisModal] = useState(false);
  const [lokalTekst, settLokalTekst] = useState("");

  const tekstVerdi = typeof verdi === "string" ? verdi : "";

  const åpneModal = () => {
    if (leseModus) return;
    settLokalTekst(tekstVerdi);
    settVisModal(true);
  };

  const ferdig = () => {
    onEndreVerdi(lokalTekst);
    settVisModal(false);
  };

  return (
    <>
      <Pressable
        onPress={åpneModal}
        className={`rounded-lg border border-gray-300 bg-white px-3 py-2.5 ${
          leseModus ? "bg-gray-50" : ""
        }`}
      >
        <Text
          className={`text-sm ${
            tekstVerdi ? "text-gray-900" : "text-gray-400"
          } ${leseModus ? "text-gray-500" : ""}`}
        >
          {tekstVerdi || "Trykk for å skrive..."}
        </Text>
      </Pressable>

      <Modal visible={visModal} animationType="slide" onRequestClose={ferdig}>
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 bg-[#1e40af] px-4 py-3">
              <Text className="flex-1 text-base font-semibold text-white" numberOfLines={1}>
                {objekt.label}
              </Text>
              <Pressable onPress={ferdig} className="ml-3 rounded-lg bg-white/20 px-4 py-1.5">
                <Text className="text-sm font-semibold text-white">Ferdig</Text>
              </Pressable>
            </View>

            {/* Tekstredigering */}
            <TextInput
              value={lokalTekst}
              onChangeText={settLokalTekst}
              placeholder="Skriv inn tekst..."
              multiline
              autoFocus
              textAlignVertical="top"
              className="flex-1 px-4 py-3 text-base text-gray-900"
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
