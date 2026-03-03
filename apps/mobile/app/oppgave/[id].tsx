import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  ClipboardCheck,
  CalendarDays,
} from "lucide-react-native";
import { hentStatusHandlinger } from "@siteflow/shared";
import type { StatusHandling } from "@siteflow/shared";
import { trpc } from "../../src/lib/trpc";
import { useAuth } from "../../src/providers/AuthProvider";
import { StatusMerkelapp } from "../../src/components/StatusMerkelapp";

const PRIORITETER = [
  { verdi: "low", label: "Lav", farge: "bg-gray-200 text-gray-700" },
  { verdi: "medium", label: "Medium", farge: "bg-blue-100 text-blue-700" },
  { verdi: "high", label: "Høy", farge: "bg-orange-100 text-orange-700" },
  { verdi: "critical", label: "Kritisk", farge: "bg-red-100 text-red-700" },
] as const;

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

function formaterNummer(
  prefix: string | null | undefined,
  nummer: number | null | undefined,
): string | null {
  if (!prefix || nummer == null) return null;
  return `${prefix}${nummer}`;
}

export default function OppgaveDetalj() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { bruker } = useAuth();
  const utils = trpc.useUtils();

  const [redigererTittel, setRedigererTittel] = useState(false);
  const [redigererBeskrivelse, setRedigererBeskrivelse] = useState(false);
  const [tittelUtkast, setTittelUtkast] = useState("");
  const [beskrivelseUtkast, setBeskrivelseUtkast] = useState("");

  const oppgaveQuery = trpc.oppgave.hentMedId.useQuery(
    { id: id! },
    { enabled: !!id },
  );

  // eslint-disable-next-line
  const oppgave = oppgaveQuery.data as {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    number: number | null;
    dueDate: Date | string | null;
    createdAt: Date | string;
    template?: { name: string; prefix?: string | null } | null;
    creator?: { name: string | null } | null;
    creatorEnterprise?: { name: string } | null;
    responderEnterprise?: { name: string } | null;
    checklist?: {
      id: string;
      number: number | null;
      title: string;
      template?: { prefix?: string | null; name?: string | null } | null;
    } | null;
    checklistFieldId?: string | null;
    transfers?: Transfer[];
  } | undefined;

  const endreStatusMutasjon = trpc.oppgave.endreStatus.useMutation({
    onSuccess: () => {
      utils.oppgave.hentMedId.invalidate({ id: id! });
      utils.oppgave.hentForProsjekt.invalidate();
    },
  });

  const oppdaterMutasjon = trpc.oppgave.oppdater.useMutation({
    onSuccess: () => {
      utils.oppgave.hentMedId.invalidate({ id: id! });
    },
  });

  const håndterStatusEndring = useCallback(
    (handling: StatusHandling) => {
      if (!bruker?.id) return;

      const bekreftTekst = handling.nyStatus === "cancelled" ? "Ja, avbryt" : handling.tekst;
      const erDestruktiv = handling.nyStatus === "rejected" || handling.nyStatus === "cancelled";

      Alert.alert(
        "Bekreft statusendring",
        `Er du sikker på at du vil endre status til "${handling.tekst.toLowerCase()}"?`,
        [
          { text: "Nei", style: "cancel" },
          {
            text: bekreftTekst,
            style: erDestruktiv ? "destructive" : "default",
            onPress: async () => {
              try {
                await endreStatusMutasjon.mutateAsync({
                  id: id!,
                  nyStatus: handling.nyStatus,
                  senderId: bruker.id,
                });
              } catch {
                Alert.alert("Feil", "Kunne ikke endre status. Prøv igjen.");
              }
            },
          },
        ],
      );
    },
    [bruker?.id, id, endreStatusMutasjon],
  );

  const lagreTittel = useCallback(() => {
    if (!oppgave || !tittelUtkast.trim()) return;
    oppdaterMutasjon.mutate({ id: oppgave.id, title: tittelUtkast.trim() });
    setRedigererTittel(false);
  }, [oppgave, tittelUtkast, oppdaterMutasjon]);

  const lagreBeskrivelse = useCallback(() => {
    if (!oppgave) return;
    oppdaterMutasjon.mutate({ id: oppgave.id, description: beskrivelseUtkast.trim() || undefined });
    setRedigererBeskrivelse(false);
  }, [oppgave, beskrivelseUtkast, oppdaterMutasjon]);

  const endrePrioritet = useCallback(
    (nyPrioritet: string) => {
      if (!oppgave) return;
      oppdaterMutasjon.mutate({ id: oppgave.id, priority: nyPrioritet as "low" | "medium" | "high" | "critical" });
    },
    [oppgave, oppdaterMutasjon],
  );

  if (oppgaveQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1e40af" />
        <Text className="mt-3 text-sm text-gray-500">Henter oppgave...</Text>
      </SafeAreaView>
    );
  }

  if (!oppgave) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-base text-gray-500">Oppgaven ble ikke funnet</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-600">Gå tilbake</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const nummer = formaterNummer(oppgave.template?.prefix, oppgave.number);
  const handlinger = hentStatusHandlinger(oppgave.status);
  const overforinger = oppgave.transfers ?? [];

  // Sjekkliste-referanse
  const sjekklisteNummer = oppgave.checklist
    ? formaterNummer(oppgave.checklist.template?.prefix, oppgave.checklist.number)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-siteflow-blue px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-2">
          <ArrowLeft size={22} color="#ffffff" />
        </Pressable>
        <Text className="flex-1 px-3 text-center text-base font-semibold text-white" numberOfLines={1}>
          {nummer ? `${nummer} ` : ""}Oppgave
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 p-3 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Tittel */}
        <View className="rounded-lg bg-white p-4">
          <Text className="mb-1 text-xs font-medium text-gray-500">Tittel</Text>
          {redigererTittel ? (
            <View>
              <TextInput
                className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-gray-900"
                value={tittelUtkast}
                onChangeText={setTittelUtkast}
                autoFocus
                onSubmitEditing={lagreTittel}
              />
              <View className="mt-2 flex-row gap-2">
                <Pressable
                  onPress={lagreTittel}
                  className="rounded-lg bg-blue-600 px-4 py-2"
                >
                  <Text className="text-xs font-medium text-white">Lagre</Text>
                </Pressable>
                <Pressable
                  onPress={() => setRedigererTittel(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2"
                >
                  <Text className="text-xs font-medium text-gray-600">Avbryt</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setTittelUtkast(oppgave.title);
                setRedigererTittel(true);
              }}
            >
              <Text className="text-base font-semibold text-gray-900">{oppgave.title}</Text>
            </Pressable>
          )}
        </View>

        {/* Metadata */}
        <View className="rounded-lg bg-white p-4">
          <View className="flex-row items-center gap-3">
            <StatusMerkelapp status={oppgave.status} />
            {nummer && (
              <Text className="text-sm font-medium text-gray-600">{nummer}</Text>
            )}
          </View>

          <View className="mt-3 gap-2">
            {oppgave.template && (
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">Mal:</Text>
                <Text className="text-xs text-gray-700">{oppgave.template.name}</Text>
              </View>
            )}
            {oppgave.creatorEnterprise && (
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">Oppretter:</Text>
                <Text className="text-xs text-gray-700">{oppgave.creatorEnterprise.name}</Text>
              </View>
            )}
            {oppgave.responderEnterprise && (
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">Svarer:</Text>
                <Text className="text-xs text-gray-700">{oppgave.responderEnterprise.name}</Text>
              </View>
            )}
            {oppgave.creator?.name && (
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">Opprettet av:</Text>
                <Text className="text-xs text-gray-700">{oppgave.creator.name}</Text>
              </View>
            )}
            <View className="flex-row items-center gap-2">
              <CalendarDays size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-500">
                {new Date(oppgave.createdAt).toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Prioritet */}
        <View className="rounded-lg bg-white p-4">
          <Text className="mb-2 text-xs font-medium text-gray-500">Prioritet</Text>
          <View className="flex-row gap-2">
            {PRIORITETER.map((p) => {
              const erValgt = oppgave.priority === p.verdi;
              return (
                <Pressable
                  key={p.verdi}
                  onPress={() => endrePrioritet(p.verdi)}
                  className={`rounded-full px-3 py-1.5 ${erValgt ? p.farge : "bg-gray-100"}`}
                >
                  <Text
                    className={`text-xs font-medium ${erValgt ? "" : "text-gray-500"}`}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Beskrivelse */}
        <View className="rounded-lg bg-white p-4">
          <Text className="mb-1 text-xs font-medium text-gray-500">Beskrivelse</Text>
          {redigererBeskrivelse ? (
            <View>
              <TextInput
                className="min-h-[80px] rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-gray-900"
                value={beskrivelseUtkast}
                onChangeText={setBeskrivelseUtkast}
                multiline
                autoFocus
                textAlignVertical="top"
              />
              <View className="mt-2 flex-row gap-2">
                <Pressable
                  onPress={lagreBeskrivelse}
                  className="rounded-lg bg-blue-600 px-4 py-2"
                >
                  <Text className="text-xs font-medium text-white">Lagre</Text>
                </Pressable>
                <Pressable
                  onPress={() => setRedigererBeskrivelse(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2"
                >
                  <Text className="text-xs font-medium text-gray-600">Avbryt</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setBeskrivelseUtkast(oppgave.description ?? "");
                setRedigererBeskrivelse(true);
              }}
            >
              <Text className={`text-sm ${oppgave.description ? "text-gray-800" : "text-gray-400 italic"}`}>
                {oppgave.description || "Trykk for å legge til beskrivelse…"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Sjekkliste-kobling */}
        {oppgave.checklist && (
          <Pressable
            onPress={() => router.push(`/sjekkliste/${oppgave.checklist!.id}`)}
            className="flex-row items-center gap-3 rounded-lg bg-blue-50 p-4"
          >
            <ClipboardCheck size={18} color="#2563eb" />
            <View className="flex-1">
              <Text className="text-xs font-medium text-blue-600">Fra sjekkliste</Text>
              <Text className="text-sm text-blue-800">
                {sjekklisteNummer ? `${sjekklisteNummer} ` : ""}{oppgave.checklist.title}
              </Text>
            </View>
          </Pressable>
        )}

        {/* Historikk */}
        {overforinger.length > 0 && (
          <View className="mt-2">
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

      {/* Statusknapper i bunn */}
      {handlinger.length > 0 && (
        <View className="border-t border-gray-200 bg-white px-4 py-3">
          <View className={handlinger.length > 1 ? "flex-row gap-2" : ""}>
            {handlinger.map((handling) => (
              <Pressable
                key={handling.nyStatus}
                onPress={() => håndterStatusEndring(handling)}
                disabled={endreStatusMutasjon.isPending}
                className={`items-center rounded-lg py-3 ${handlinger.length > 1 ? "flex-1" : ""} ${endreStatusMutasjon.isPending ? handling.aktivFarge : handling.farge}`}
              >
                {endreStatusMutasjon.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-medium text-white">{handling.tekst}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
