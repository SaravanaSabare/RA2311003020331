import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Server-side proxy for frontend logs → avoids exposing token to browser
const LOG_URL = "http://20.207.122.201/evaluation-service/logs";
const AUTH_URL = "http://20.207.122.201/evaluation-service/auth";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const res = await axios.post(AUTH_URL, {
    email: process.env.CLIENT_EMAIL,
    name: process.env.CLIENT_NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  cachedToken = res.data.access_token;
  tokenExpiresAt = Date.now() + (res.data.expires_in - 60) * 1000;
  return cachedToken as string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const token = await getToken();
    const logRes = await axios.post(LOG_URL, req.body, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    return res.status(200).json(logRes.data);
  } catch {
    return res.status(500).json({ error: "Failed to send log" });
  }
}
