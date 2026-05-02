import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const AUTH_URL = "http://20.207.122.201/evaluation-service/auth";

interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Fetches a fresh Bearer token from the evaluation service.
 * Caches the token until it expires to avoid redundant auth calls.
 */
export async function getAuthToken(): Promise<string> {
  const now = Date.now();

  if (tokenCache && now < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const payload = {
    email: process.env.CLIENT_EMAIL,
    name: process.env.CLIENT_NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  };

  const response = await axios.post<AuthResponse>(AUTH_URL, payload, {
    headers: { "Content-Type": "application/json" },
  });

  const { access_token, expires_in } = response.data;

  // Cache token with a 60-second buffer before expiry
  tokenCache = {
    token: access_token,
    expiresAt: now + (expires_in - 60) * 1000,
  };

  return access_token;
}
