import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { AUTH_CONFIG, GOOGLE_AUTH, MICROSOFT_AUTH } from "../config/auth";

WebBrowser.maybeCompleteAuthSession();

const SESSION_TOKEN_KEY = "siteflow_session_token";
const USER_DATA_KEY = "siteflow_user_data";

export interface BrukerData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

// --- Token-lagring (SecureStore) ---

export async function lagreSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function hentSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function slettSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

export async function lagreBrukerData(bruker: BrukerData): Promise<void> {
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(bruker));
}

export async function hentBrukerData(): Promise<BrukerData | null> {
  const data = await SecureStore.getItemAsync(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function slettBrukerData(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
}

// --- OAuth-flyt ---

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "siteflow",
});

export async function loggInnMedGoogle(): Promise<string | null> {
  const request = new AuthSession.AuthRequest({
    clientId: AUTH_CONFIG.googleClientId,
    redirectUri,
    scopes: ["openid", "email", "profile"],
    responseType: AuthSession.ResponseType.Token,
  });

  const result = await request.promptAsync({
    authorizationEndpoint: GOOGLE_AUTH.authorizationEndpoint,
  });

  if (result.type === "success" && result.authentication?.accessToken) {
    return result.authentication.accessToken;
  }

  return null;
}

export async function loggInnMedMicrosoft(): Promise<string | null> {
  const request = new AuthSession.AuthRequest({
    clientId: AUTH_CONFIG.microsoftClientId,
    redirectUri,
    scopes: ["openid", "email", "profile", "User.Read"],
    responseType: AuthSession.ResponseType.Token,
  });

  const result = await request.promptAsync({
    authorizationEndpoint: MICROSOFT_AUTH.authorizationEndpoint,
  });

  if (result.type === "success" && result.authentication?.accessToken) {
    return result.authentication.accessToken;
  }

  return null;
}

export async function loggUt(): Promise<void> {
  await slettSessionToken();
  await slettBrukerData();
}
