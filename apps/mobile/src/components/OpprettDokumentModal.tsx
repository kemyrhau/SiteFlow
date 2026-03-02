import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useProsjekt } from "../kontekst/ProsjektKontekst";

type Prioritet = "low" | "medium" | "high" | "critical";

interface EntrepriseData {
  id: string;
  name: string;
}

interface MalData {
  id: string;
  name: string;
  prefix: string | null;
  category: string;
}

interface OpprettDokumentModalProps {
  synlig: boolean;
  kategori: "sjekkliste" | "oppgave";
  mal: MalData;
  onOpprettet: (id: string) => void;
  onLukk: () => void;
}

const PRIORITETER: { verdi: Prioritet; label: string }[] = [
  { verdi: "low", label: "Lav" },
  { verdi: "medium", label: "Medium" },
  { verdi: "high", label: "Høy" },
  { verdi: "critical", label: "Kritisk" },
];

const PRIORITET_FARGER: Record<Prioritet, string> = {
  low: "bg-gray-200 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function OpprettDokumentModal({
  synlig,
  kategori,
  mal,
  onOpprettet,
  onLukk,
}: OpprettDokumentModalProps) {
  const { valgtProsjektId } = useProsjekt();

  const [tittel, setTittel] = useState("");
  const [prioritet, setPrioritet] = useState<Prioritet>("medium");
  const [oppretterEntrepriseId, setOppretterEntrepriseId] = useState<string | null>(null);
  const [svarerEntrepriseId, setSvarerEntrepriseId] = useState<string | null>(null);
  const [visOppretterListe, setVisOppretterListe] = useState(false);
  const [visSvarerListe, setVisSvarerListe] = useState(false);

  const entrepriseQuery = trpc.entreprise.hentForProsjekt.useQuery(
    { projectId: valgtProsjektId! },
    { enabled: !!valgtProsjektId && synlig },
  );

  const entrepriser = (entrepriseQuery.data ?? []) as EntrepriseData[];

  // eslint-disable-next-line
  const opprettSjekkliste = trpc.sjekkliste.opprett.useMutation({
    onSuccess: (_data: unknown) => {
      const resultat = _data as { id: string };
      nullstillSkjema();
      onOpprettet(resultat.id);
    },
    onError: (feil: { message: string }) => {
      Alert.alert("Feil", feil.message || "Kunne ikke opprette sjekkliste");
    },
  });

  // eslint-disable-next-line
  const opprettOppgave = trpc.oppgave.opprett.useMutation({
    onSuccess: (_data: unknown) => {
      const resultat = _data as { id: string };
      nullstillSkjema();
      onOpprettet(resultat.id);
    },
    onError: (feil: { message: string }) => {
      Alert.alert("Feil", feil.message || "Kunne ikke opprette oppgave");
    },
  });

  const erPending = opprettSjekkliste.isPending || opprettOppgave.isPending;

  const nullstillSkjema = useCallback(() => {
    setTittel("");
    setPrioritet("medium");
    setOppretterEntrepriseId(null);
    setSvarerEntrepriseId(null);
    setVisOppretterListe(false);
    setVisSvarerListe(false);
  }, []);

  const håndterAvbryt = useCallback(() => {
    nullstillSkjema();
    onLukk();
  }, [nullstillSkjema, onLukk]);

  const håndterOpprett = useCallback(() => {
    if (!tittel.trim()) {
      Alert.alert("Mangler tittel", "Skriv inn en tittel");
      return;
    }
    if (!oppretterEntrepriseId) {
      Alert.alert("Mangler oppretter", "Velg en oppretter-entreprise");
      return;
    }
    if (!svarerEntrepriseId) {
      Alert.alert("Mangler svarer", "Velg en svarer-entreprise");
      return;
    }

    if (kategori === "sjekkliste") {
      opprettSjekkliste.mutate({
        templateId: mal.id,
        creatorEnterpriseId: oppretterEntrepriseId,
        responderEnterpriseId: svarerEntrepriseId,
        title: tittel.trim(),
      });
    } else {
      opprettOppgave.mutate({
        templateId: mal.id,
        creatorEnterpriseId: oppretterEntrepriseId,
        responderEnterpriseId: svarerEntrepriseId,
        title: tittel.trim(),
        priority: prioritet,
      });
    }
  }, [
    tittel,
    prioritet,
    oppretterEntrepriseId,
    svarerEntrepriseId,
    kategori,
    mal.id,
    opprettSjekkliste,
    opprettOppgave,
  ]);

  const valgtOppretter = entrepriser.find((e) => e.id === oppretterEntrepriseId);
  const valgtSvarer = entrepriser.find((e) => e.id === svarerEntrepriseId);

  const kanOpprett =
    tittel.trim().length > 0 &&
    !!oppretterEntrepriseId &&
    !!svarerEntrepriseId &&
    !erPending;

  return (
    <Modal visible={synlig} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        {/* Header */}
        <View className="flex-row items-center justify-between bg-siteflow-blue px-4 py-3">
          <Pressable onPress={håndterAvbryt} hitSlop={8}>
            <Text className="text-sm font-medium text-white">Avbryt</Text>
          </Pressable>
          <Text className="text-sm font-semibold text-white">
            Ny {kategori === "sjekkliste" ? "sjekkliste" : "oppgave"}
          </Text>
          <Pressable onPress={håndterOpprett} disabled={!kanOpprett} hitSlop={8}>
            {erPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                className={`text-sm font-medium ${kanOpprett ? "text-white" : "text-white/40"}`}
              >
                Opprett
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* Mal-info med prefix-badge */}
          <View className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <Text className="text-xs font-medium text-gray-500">Mal</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Text className="text-sm font-medium text-gray-900">{mal.name}</Text>
              {mal.prefix ? (
                <View className="rounded bg-blue-100 px-2 py-0.5">
                  <Text className="text-xs font-medium text-blue-700">{mal.prefix}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Tittel */}
          <View className="border-b border-gray-100 px-4 py-3">
            <Text className="mb-1 text-xs font-medium text-gray-500">Tittel *</Text>
            <TextInput
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800"
              placeholder="Skriv tittel…"
              placeholderTextColor="#9ca3af"
              value={tittel}
              onChangeText={setTittel}
              autoFocus
            />
          </View>

          {/* Prioritet — kun for oppgaver */}
          {kategori === "oppgave" && (
            <View className="border-b border-gray-100 px-4 py-3">
              <Text className="mb-2 text-xs font-medium text-gray-500">Prioritet</Text>
              <View className="flex-row gap-2">
                {PRIORITETER.map((p) => {
                  const erValgt = prioritet === p.verdi;
                  return (
                    <Pressable
                      key={p.verdi}
                      onPress={() => setPrioritet(p.verdi)}
                      className={`rounded-full px-3 py-1.5 ${erValgt ? PRIORITET_FARGER[p.verdi] : "bg-gray-100"}`}
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
          )}

          {/* Oppretter-entreprise */}
          <View className="border-b border-gray-100 px-4 py-3">
            <Text className="mb-1 text-xs font-medium text-gray-500">
              Oppretter-entreprise *
            </Text>
            <Pressable
              onPress={() => {
                setVisOppretterListe(!visOppretterListe);
                setVisSvarerListe(false);
              }}
              className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
            >
              <Text
                className={`text-sm ${valgtOppretter ? "text-gray-800" : "text-gray-400"}`}
              >
                {valgtOppretter?.name ?? "Velg entreprise…"}
              </Text>
              <ChevronDown size={16} color="#9ca3af" />
            </Pressable>
            {visOppretterListe && (
              <View className="mt-1 rounded-lg border border-gray-200 bg-white">
                {entrepriser.map((e) => (
                  <Pressable
                    key={e.id}
                    onPress={() => {
                      setOppretterEntrepriseId(e.id);
                      setVisOppretterListe(false);
                    }}
                    className={`border-b border-gray-50 px-3 py-2.5 ${oppretterEntrepriseId === e.id ? "bg-blue-50" : ""}`}
                  >
                    <Text
                      className={`text-sm ${oppretterEntrepriseId === e.id ? "font-medium text-blue-700" : "text-gray-700"}`}
                    >
                      {e.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Svarer-entreprise */}
          <View className="border-b border-gray-100 px-4 py-3">
            <Text className="mb-1 text-xs font-medium text-gray-500">
              Svarer-entreprise *
            </Text>
            <Pressable
              onPress={() => {
                setVisSvarerListe(!visSvarerListe);
                setVisOppretterListe(false);
              }}
              className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
            >
              <Text
                className={`text-sm ${valgtSvarer ? "text-gray-800" : "text-gray-400"}`}
              >
                {valgtSvarer?.name ?? "Velg entreprise…"}
              </Text>
              <ChevronDown size={16} color="#9ca3af" />
            </Pressable>
            {visSvarerListe && (
              <View className="mt-1 rounded-lg border border-gray-200 bg-white">
                {entrepriser.map((e) => (
                  <Pressable
                    key={e.id}
                    onPress={() => {
                      setSvarerEntrepriseId(e.id);
                      setVisSvarerListe(false);
                    }}
                    className={`border-b border-gray-50 px-3 py-2.5 ${svarerEntrepriseId === e.id ? "bg-blue-50" : ""}`}
                  >
                    <Text
                      className={`text-sm ${svarerEntrepriseId === e.id ? "font-medium text-blue-700" : "text-gray-700"}`}
                    >
                      {e.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
