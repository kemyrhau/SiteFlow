import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Clock, X } from "lucide-react-native";
import type { RapportObjektProps } from "./typer";

export function DatoTidObjekt({ verdi, onEndreVerdi, leseModus }: RapportObjektProps) {
  const [visModus, settVisModus] = useState<"date" | "time" | null>(null);
  const datoVerdi = typeof verdi === "string" ? new Date(verdi) : null;

  const formaterDato = (dato: Date) =>
    dato.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });

  const formaterTid = (dato: Date) =>
    dato.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  const haandterDatoTrykk = () => {
    if (leseModus) return;
    if (!datoVerdi) {
      onEndreVerdi(new Date().toISOString());
    }
    settVisModus("date");
  };

  const haandterTidTrykk = () => {
    if (leseModus) return;
    if (!datoVerdi) {
      onEndreVerdi(new Date().toISOString());
    }
    settVisModus("time");
  };

  const settNaa = () => {
    onEndreVerdi(new Date().toISOString());
  };

  const fjernVerdi = () => {
    onEndreVerdi(null);
    settVisModus(null);
  };

  return (
    <View>
      <View className="flex-row gap-2">
        {/* Dato-felt */}
        <Pressable
          onPress={haandterDatoTrykk}
          className={`flex-[2] flex-row items-center rounded-lg border border-gray-300 bg-white px-3 py-2.5 ${
            leseModus ? "bg-gray-50" : ""
          }`}
        >
          <Calendar size={18} color="#6b7280" />
          <Text className={`ml-2 flex-1 text-sm ${datoVerdi ? "text-gray-900" : "text-gray-400"}`}>
            {datoVerdi ? formaterDato(datoVerdi) : "Velg dato..."}
          </Text>
          {datoVerdi && !leseModus && (
            <Pressable onPress={fjernVerdi} hitSlop={8}>
              <X size={16} color="#9ca3af" />
            </Pressable>
          )}
        </Pressable>

        {/* Tid-felt */}
        <Pressable
          onPress={haandterTidTrykk}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2.5 ${
            leseModus ? "bg-gray-50" : ""
          }`}
        >
          <Clock size={18} color="#6b7280" />
          <Text className={`text-sm ${datoVerdi ? "text-gray-900" : "text-gray-400"}`}>
            {datoVerdi ? formaterTid(datoVerdi) : "--:--"}
          </Text>
        </Pressable>
      </View>

      {datoVerdi && !leseModus && (
        <Pressable onPress={settNaa} className="mt-1 ml-1">
          <Text className="text-sm text-blue-600">Nå</Text>
        </Pressable>
      )}

      {visModus && (
        <DateTimePicker
          value={datoVerdi ?? new Date()}
          mode={visModus}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, valgtDato) => {
            if (Platform.OS !== "ios") settVisModus(null);
            if (!valgtDato) return;

            if (visModus === "date") {
              const nyDato = datoVerdi ? new Date(datoVerdi) : new Date();
              nyDato.setFullYear(valgtDato.getFullYear(), valgtDato.getMonth(), valgtDato.getDate());
              onEndreVerdi(nyDato.toISOString());
              if (Platform.OS !== "ios") settVisModus("time");
            } else {
              const nyDato = datoVerdi ? new Date(datoVerdi) : new Date();
              nyDato.setHours(valgtDato.getHours(), valgtDato.getMinutes());
              onEndreVerdi(nyDato.toISOString());
              if (Platform.OS === "ios") settVisModus(null);
            }
          }}
        />
      )}
    </View>
  );
}
