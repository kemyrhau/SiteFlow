import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@sitedoc/api/src/trpc/router";
import { AUTH_CONFIG } from "../config/auth";
import { hentSessionToken } from "../services/auth";

export const trpc = createTRPCReact<AppRouter>();

export function opprettTrpcKlient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${AUTH_CONFIG.apiUrl}/trpc`,
        async headers() {
          const token = await hentSessionToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
