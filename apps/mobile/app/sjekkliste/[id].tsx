import { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Save, Check, AlertTriangle, Clock } from "lucide-react-native";
import { harBetingelse } from "@siteflow/shared";
import { useSjekklisteSkjema } from "../../src/hooks/useSjekklisteSkjema";
import { StatusMerkelapp } from "../../src/components/StatusMerkelapp";
import { RapportObjektRenderer, DISPLAY_TYPER } from "../../src/components/rapportobjekter";
import { FeltWrapper } from "../../src/components/rapportobjekter/FeltWrapper";
import { trpc } from "../../src/lib/trpc";

interface Transfer {
  id: string;
  fromStatus: string;
  toStatus: string;
  comment: string | null;
  createdAt: Date | string;
  sender?: { name: string | null } | null;
}

function formaterHistorikkDato(dato: Date | string): string {
  const d = new Date(dato);
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SjekklisteUtfylling() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Hent overføringer for historikk
  const detaljQuery = trpc.sjekkliste.hentMedId.useQuery(
    { id: id! },
    { enabled: !!id },
  );
  const overforinger = (detaljQuery.data as { transfers?: Transfer[] } | undefined)?.transfers;

  const {
    sjekkliste,
    erLaster,
    hentFeltVerdi,
    settVerdi,
    settKommentar,
    leggTilVedlegg,
    fjernVedlegg,
    erSynlig,
    valideringsfeil,
    valider,
    lagre,
    erLagrer,
    harEndringer,
    erRedigerbar,
    lagreStatus,
  } = useSjekklisteSkjema(id!);

  const håndterTilbake = useCallback(async () => {
    if (harEndringer) {
      await lagre();
    }
    router.back();
  }, [harEndringer, lagre, router]);

  const håndterLagre = useCallback(async () => {
    const erGyldig = valider();
    if (!erGyldig) {
      Alert.alert("Valideringsfeil", "Fyll inn alle påkrevde felt før du lagrer.");
      return;
    }
    await lagre();
    Alert.alert("Lagret", "Utfyllingen er lagret.");
  }, [valider, lagre]);

  if (erLaster) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1e40af" />
        <Text className="mt-3 text-sm text-gray-500">Henter sjekkliste...</Text>
      </SafeAreaView>
    );
  }

  if (!sjekkliste) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-base text-gray-500">Sjekklisten ble ikke funnet</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-600">Gå tilbake</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const objekter = sjekkliste.template.objects
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const leseModus = !erRedigerbar;

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-siteflow-blue px-4 py-3">
        <Pressable onPress={håndterTilbake} hitSlop={12} className="flex-row items-center gap-2">
          <ArrowLeft size={22} color="#ffffff" />
        </Pressable>
        <Text className="flex-1 px-3 text-center text-base font-semibold text-white" numberOfLines={1}>
          {sjekkliste.title}
        </Text>
        {erRedigerbar && (
          <View className="flex-row items-center gap-2">
            {lagreStatus === "lagrer" && (
              <ActivityIndicator size="small" color="#93c5fd" />
            )}
            {lagreStatus === "lagret" && (
              <Check size={18} color="#86efac" />
            )}
            {lagreStatus === "feil" && (
              <AlertTriangle size={18} color="#fca5a5" />
            )}
            <Pressable onPress={håndterLagre} hitSlop={12} disabled={erLagrer}>
              <Save size={22} color={erLagrer ? "#93c5fd" : "#ffffff"} />
            </Pressable>
          </View>
        )}
        {!erRedigerbar && <View style={{ width: 22 }} />}
      </View>

      {/* Metadata-bar */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <View className="flex-row items-center gap-2">
          {sjekkliste.template.prefix && (
            <Text className="text-xs font-medium text-gray-500">
              {sjekkliste.template.prefix}
            </Text>
          )}
          <Text className="text-sm text-gray-700" numberOfLines={1}>
            {sjekkliste.template.name}
          </Text>
        </View>
        <StatusMerkelapp status={sjekkliste.status} />
      </View>

      {/* Entrepriser */}
      <View className="flex-row border-b border-gray-200 bg-white px-4 py-1.5">
        {sjekkliste.creatorEnterprise && (
          <Text className="flex-1 text-xs text-gray-500">
            Oppretter: {sjekkliste.creatorEnterprise.name}
          </Text>
        )}
        {sjekkliste.responderEnterprise && (
          <Text className="flex-1 text-right text-xs text-gray-500">
            Svarer: {sjekkliste.responderEnterprise.name}
          </Text>
        )}
      </View>

      {/* Felter */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 p-3 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {objekter.map((objekt) => {
          // Sjekk synlighet (betinget felt)
          if (!erSynlig(objekt)) return null;

          const erDisplay = DISPLAY_TYPER.has(objekt.type);
          const erBetinget = harBetingelse(objekt.config);

          // Display-typer (heading, subtitle) rendres uten wrapper
          if (erDisplay) {
            return (
              <View key={objekt.id} className={erBetinget ? "ml-4 border-l-2 border-l-blue-300 pl-3" : ""}>
                <RapportObjektRenderer
                  objekt={objekt}
                  verdi={null}
                  onEndreVerdi={() => {}}
                  leseModus={leseModus}
                />
              </View>
            );
          }

          // Utfyllbare felt med FeltWrapper
          const feltVerdi = hentFeltVerdi(objekt.id);

          return (
            <FeltWrapper
              key={objekt.id}
              objekt={objekt}
              kommentar={feltVerdi.kommentar}
              vedlegg={feltVerdi.vedlegg}
              onEndreKommentar={(k) => settKommentar(objekt.id, k)}
              onLeggTilVedlegg={(v) => leggTilVedlegg(objekt.id, v)}
              onFjernVedlegg={(vId) => fjernVedlegg(objekt.id, vId)}
              leseModus={leseModus}
              sjekklisteId={sjekkliste.id}
              erBetinget={erBetinget}
              valideringsfeil={valideringsfeil[objekt.id]}
            >
              <RapportObjektRenderer
                objekt={objekt}
                verdi={feltVerdi.verdi}
                onEndreVerdi={(v) => settVerdi(objekt.id, v)}
                leseModus={leseModus}
              />
            </FeltWrapper>
          );
        })}

        {/* Historikk */}
        {overforinger && overforinger.length > 0 && (
          <View className="mt-4">
            <View className="flex-row items-center gap-2 px-1 pb-2">
              <Clock size={16} color="#6b7280" />
              <Text className="text-sm font-semibold text-gray-700">Historikk</Text>
            </View>
            <View className="rounded-lg bg-white">
              {overforinger.map((t, i) => (
                <View
                  key={t.id}
                  className={`flex-row items-center gap-2 px-3 py-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <StatusMerkelapp status={t.fromStatus} />
                      <Text className="text-xs text-gray-400">→</Text>
                      <StatusMerkelapp status={t.toStatus} />
                    </View>
                    {t.sender?.name && (
                      <Text className="mt-0.5 text-xs text-gray-500">{t.sender.name}</Text>
                    )}
                    {t.comment && (
                      <Text className="mt-0.5 text-xs text-gray-600">{t.comment}</Text>
                    )}
                  </View>
                  <Text className="text-xs text-gray-400">
                    {formaterHistorikkDato(t.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Lagre-knapp i bunn */}
      {erRedigerbar && (
        <View className="border-t border-gray-200 bg-white px-4 py-3">
          <Pressable
            onPress={håndterLagre}
            disabled={erLagrer}
            className={`items-center rounded-lg py-3 ${erLagrer ? "bg-blue-400" : "bg-blue-600"}`}
          >
            <Text className="font-medium text-white">
              {erLagrer ? "Lagrer..." : "Lagre utfylling"}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
