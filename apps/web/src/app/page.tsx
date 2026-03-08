import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  ClipboardCheck,
  CheckSquare,
  FileText,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  Shield,
  Building2,
  Users,
  BarChart3,
  Smartphone,
  ArrowRight,
  CloudSun,
  Layers,
} from "lucide-react";

export default async function Hjem() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashbord");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigasjon */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-sitedoc-primary">
            SiteDoc
          </span>
          <div className="flex items-center gap-4">
            <a
              href="#funksjoner"
              className="hidden text-sm text-gray-600 hover:text-gray-900 sm:block"
            >
              Funksjoner
            </a>
            <a
              href="#plattform"
              className="hidden text-sm text-gray-600 hover:text-gray-900 sm:block"
            >
              Plattform
            </a>
            <a
              href="/logg-inn"
              className="rounded-lg bg-sitedoc-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Logg inn
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50/30" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm text-sitedoc-primary">
              <Building2 className="h-4 w-4" />
              For byggebransjen
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Kvalitetsstyring
              <br />
              <span className="text-sitedoc-primary">enklere enn noensinne</span>
            </h1>
            <p className="mb-10 text-lg text-gray-600 sm:text-xl">
              SiteDoc er et komplett rapport- og kvalitetsstyringssystem for
              byggeprosjekter. Sjekklister, oppgaver, tegninger og
              dokumenthåndtering — alt samlet på én plattform.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/logg-inn"
                className="inline-flex items-center gap-2 rounded-lg bg-sitedoc-primary px-8 py-3.5 text-base font-medium text-white transition hover:bg-blue-700"
              >
                Kom i gang
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#funksjoner"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Se funksjoner
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Nøkkeltall */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {[
            { tall: "23", label: "Rapportobjekttyper" },
            { tall: "9", label: "Statusnivåer" },
            { tall: "100%", label: "Offline-støtte" },
            { tall: "3", label: "Plattformer" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-bold text-sitedoc-primary sm:text-3xl">
                {item.tall}
              </div>
              <div className="mt-1 text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hovedfunksjoner */}
      <section id="funksjoner" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Alt du trenger for kvalitetsstyring
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Fra sjekklister og oppgaver til tegningsmarkering og
              entrepriseflyt — SiteDoc dekker hele arbeidsflyten.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Funksjonsort
              ikon={<ClipboardCheck className="h-6 w-6" />}
              tittel="Sjekklister"
              beskrivelse="Strukturerte sjekklister med 23 rapportobjekttyper. Bygg maler med drag-and-drop og fyll ut på mobil eller PC."
            />
            <Funksjonsort
              ikon={<CheckSquare className="h-6 w-6" />}
              tittel="Oppgaver"
              beskrivelse="Opprett oppgaver fra sjekklister, tegninger eller frittstående. Full sporbarhet med entrepriseflyt og statusoverganger."
            />
            <Funksjonsort
              ikon={<Layers className="h-6 w-6" />}
              tittel="Tegninger"
              beskrivelse="Last opp tegninger med full metadata. Plasser markører direkte på tegningen for presis lokalisering av oppgaver."
            />
            <Funksjonsort
              ikon={<Users className="h-6 w-6" />}
              tittel="Entrepriseflyt"
              beskrivelse="Dokumenter flyter mellom oppretter og svarer-entreprise med full sporbarhet. Arbeidsforløp kobler maler til entrepriser."
            />
            <Funksjonsort
              ikon={<Camera className="h-6 w-6" />}
              tittel="Bildedokumentasjon"
              beskrivelse="Kontinuerlig kameraflyt med automatisk komprimering, GPS-tagging og annotering. Bilder synkroniseres i bakgrunnen."
            />
            <Funksjonsort
              ikon={<FileText className="h-6 w-6" />}
              tittel="PDF-eksport"
              beskrivelse="Skriv ut sjekklister som profesjonelle PDF-er med firmalogo, prosjektinfo, bilder og all utfylt data."
            />
            <Funksjonsort
              ikon={<Shield className="h-6 w-6" />}
              tittel="Tilgangskontroll"
              beskrivelse="Fleksibel tilgangsstyring med brukergrupper, entreprise-tilgang og fagområder. Admin ser alt, brukere ser sitt."
            />
            <Funksjonsort
              ikon={<CloudSun className="h-6 w-6" />}
              tittel="Automatisk vær"
              beskrivelse="Værdata hentes automatisk basert på prosjektlokasjon og befaringsdato. Temperatur, vind og forhold fylles inn for deg."
            />
            <Funksjonsort
              ikon={<MapPin className="h-6 w-6" />}
              tittel="Georeferanse"
              beskrivelse="Kalibrer tegninger med GPS-koordinater. Mobilappen plasserer automatisk markører basert på din posisjon."
            />
          </div>
        </div>
      </section>

      {/* Plattform */}
      <section id="plattform" className="border-t border-gray-100 bg-gray-50/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Én plattform, alle enheter
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Bruk SiteDoc på PC for maler og administrasjon, på mobil og
              nettbrett for utfylling i felt. Alt synkroniseres automatisk.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <Plattformkort
              ikon={<BarChart3 className="h-8 w-8" />}
              tittel="PC / Nettleser"
              funksjoner={[
                "Malbygger med drag-and-drop",
                "Entreprise- og arbeidsforløp",
                "Tegningsvisning med zoom",
                "Brukergrupper og tilgang",
                "PDF-eksport og utskrift",
              ]}
            />
            <Plattformkort
              ikon={<Smartphone className="h-8 w-8" />}
              tittel="Mobil / Nettbrett"
              funksjoner={[
                "Offline-first med lokal lagring",
                "Kamera med komprimering",
                "GPS-tagging og posisjonering",
                "Oppgaver fra tegninger",
                "Bakgrunnssynkronisering",
              ]}
              fremhevet
            />
            <Plattformkort
              ikon={<WifiOff className="h-8 w-8" />}
              tittel="Offline-modus"
              funksjoner={[
                "Full utfylling uten nett",
                "SQLite lokal database",
                "Automatisk synk ved nett",
                "Bilder lagres lokalt",
                "Ingen data går tapt",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Arbeidsflyt */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Enkel arbeidsflyt
            </h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-0">
            {[
              {
                steg: "1",
                tittel: "Bygg maler",
                beskrivelse:
                  "Opprett maler med 23 felttyper på PC. Drag-and-drop med rekursiv nesting.",
              },
              {
                steg: "2",
                tittel: "Fyll ut i felt",
                beskrivelse:
                  "Bruk mobilen for å fylle ut sjekklister og oppgaver — med bilder, GPS og signatur.",
              },
              {
                steg: "3",
                tittel: "Send og følg opp",
                beskrivelse:
                  "Dokumenter flyter mellom entrepriser med 9 statusnivåer og full sporbarhet.",
              },
              {
                steg: "4",
                tittel: "Eksporter og arkiver",
                beskrivelse:
                  "Skriv ut som PDF med all data, bilder og metadata. Klar for dokumentasjon.",
              },
            ].map((item) => (
              <div
                key={item.steg}
                className="flex gap-6 py-6"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sitedoc-primary text-sm font-bold text-white">
                    {item.steg}
                  </div>
                  {item.steg !== "4" && (
                    <div className="mt-2 h-full w-px bg-gray-200" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="font-semibold text-gray-900">{item.tittel}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.beskrivelse}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-sitedoc-primary py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Klar til å komme i gang?
          </h2>
          <p className="mb-8 text-blue-100">
            Logg inn med Google eller Microsoft 365 og start ditt første
            prosjekt.
          </p>
          <a
            href="/logg-inn"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-medium text-sitedoc-primary transition hover:bg-blue-50"
          >
            Logg inn
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-sm font-semibold text-sitedoc-primary">
              SiteDoc
            </span>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SiteDoc. Kvalitetsstyring for
              byggebransjen.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Funksjonsort({
  ikon,
  tittel,
  beskrivelse,
}: {
  ikon: React.ReactNode;
  tittel: string;
  beskrivelse: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 transition hover:border-blue-100 hover:shadow-sm">
      <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-2.5 text-sitedoc-primary">
        {ikon}
      </div>
      <h3 className="mb-2 font-semibold text-gray-900">{tittel}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{beskrivelse}</p>
    </div>
  );
}

function Plattformkort({
  ikon,
  tittel,
  funksjoner,
  fremhevet,
}: {
  ikon: React.ReactNode;
  tittel: string;
  funksjoner: string[];
  fremhevet?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-8 ${
        fremhevet
          ? "border-sitedoc-primary bg-blue-50/50 ring-1 ring-sitedoc-primary"
          : "border-gray-100 bg-white"
      }`}
    >
      <div
        className={`mb-4 ${fremhevet ? "text-sitedoc-primary" : "text-gray-400"}`}
      >
        {ikon}
      </div>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{tittel}</h3>
      <ul className="space-y-2.5">
        {funksjoner.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
            <Wifi className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sitedoc-success" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
