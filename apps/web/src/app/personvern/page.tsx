export default function PersonvernSide() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <article className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
        <a
          href="/"
          className="mb-8 block text-xl font-bold text-[#1e40af] hover:text-blue-700 transition"
        >
          SiteDoc
        </a>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Personvernerklæring
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Sist oppdatert: 8. mars 2026
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              1. Behandlingsansvarlig
            </h2>
            <p>
              SiteDoc er utviklet og driftet av Kenneth Myrhaug. Spørsmål om
              personvern kan rettes til{" "}
              <a
                href="mailto:kenneth@sitedoc.no"
                className="text-[#1e40af] underline hover:text-blue-700"
              >
                kenneth@sitedoc.no
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              2. Hvilke opplysninger vi samler inn
            </h2>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Kontoinformasjon:</strong> Navn, e-postadresse og
                profilbilde fra din Google- eller Microsoft-konto ved
                innlogging via OAuth.
              </li>
              <li>
                <strong>Prosjektdata:</strong> Sjekklister, oppgaver, bilder,
                dokumenter og annet innhold du oppretter i tilknytning til
                byggeprosjekter.
              </li>
              <li>
                <strong>Posisjonsdata:</strong> GPS-koordinater kan knyttes
                til bilder og prosjekter dersom du har aktivert dette.
                Posisjonsdeling kan deaktiveres per objekt.
              </li>
              <li>
                <strong>Teknisk informasjon:</strong> Enhetsinformasjon,
                nettverksstatus og app-bruksdata for feilsøking og
                ytelsesoptimalisering.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              3. Formål med behandlingen
            </h2>
            <p>Vi bruker opplysningene til å:</p>
            <ul className="ml-6 mt-2 list-disc space-y-2">
              <li>Gi deg tilgang til SiteDoc-plattformen og dine prosjekter</li>
              <li>
                Lagre og synkronisere prosjektdata mellom enheter (PC, mobil,
                nettbrett)
              </li>
              <li>
                Tilby offline-funksjonalitet med automatisk synkronisering når
                nettverkstilgang gjenopprettes
              </li>
              <li>Sende invitasjoner og varsler knyttet til prosjekter</li>
              <li>Forbedre tjenesten og feilsøke tekniske problemer</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              4. Rettslig grunnlag
            </h2>
            <p>
              Behandlingen er basert på avtale (bruksvilkår) og berettiget
              interesse (drift og forbedring av tjenesten), i henhold til
              personopplysningsloven og GDPR artikkel 6.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              5. Lagring og sikkerhet
            </h2>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Data lagres på servere i Norge/EU og overføres kryptert
                (HTTPS/TLS).
              </li>
              <li>
                Bilder komprimeres og lagres i S3-kompatibel lagring med
                tilgangskontroll.
              </li>
              <li>
                Autentisering håndteres via OAuth (Google/Microsoft) — vi
                lagrer aldri passord.
              </li>
              <li>
                Lokal data på mobilenheten lagres i SQLite og synkroniseres
                kryptert til server.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              6. Deling med tredjeparter
            </h2>
            <p>
              Vi deler ikke personopplysninger med tredjeparter, med unntak av:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-2">
              <li>
                <strong>Autentiseringstjenester:</strong> Google og Microsoft
                for innlogging
              </li>
              <li>
                <strong>E-posttjeneste:</strong> Resend for sending av
                prosjektinvitasjoner
              </li>
              <li>
                <strong>Værdata:</strong> Open-Meteo (anonyme forespørsler
                basert på prosjektkoordinater, ingen persondata sendes)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              7. Dine rettigheter
            </h2>
            <p>Du har rett til å:</p>
            <ul className="ml-6 mt-2 list-disc space-y-2">
              <li>Be om innsyn i opplysninger vi har om deg</li>
              <li>Be om retting eller sletting av dine opplysninger</li>
              <li>Be om begrensning av behandlingen</li>
              <li>Trekke tilbake samtykke der dette er grunnlaget</li>
              <li>Klage til Datatilsynet</li>
            </ul>
            <p className="mt-3">
              Henvendelser rettes til{" "}
              <a
                href="mailto:kenneth@sitedoc.no"
                className="text-[#1e40af] underline hover:text-blue-700"
              >
                kenneth@sitedoc.no
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              8. Endringer
            </h2>
            <p>
              Denne personvernerklæringen kan oppdateres ved behov. Vesentlige
              endringer vil bli varslet via e-post eller i appen.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
