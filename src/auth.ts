// src/auth.ts
import axios from "axios";
import { tokenStore } from "./tokenStore.js";

const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";

const SCOPES = ["sleep", "heartrate", "activity", "profile", "weight", "nutrition", "oxygen_saturation", "respiratory_rate", "temperature", "cardio_fitness", "settings"].join(" ");

export const buildAuthUrl = (): string => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.FITBIT_CLIENT_ID!,
    redirect_uri: process.env.FITBIT_REDIRECT_URI!,
    scope: SCOPES,
    expires_in: "604800",
  });
  return `${FITBIT_AUTH_URL}?${params.toString()}`;
};

const buildBasicAuth = (): string => {
  const credentials = `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
};

export const exchangeCodeForToken = async (code: string): Promise<void> => {
  const response = await axios.post(
    FITBIT_TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.FITBIT_REDIRECT_URI!,
    }),
    {
      headers: {
        Authorization: buildBasicAuth(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token, refresh_token, expires_in, user_id } = response.data;
  tokenStore.save({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: Date.now() + expires_in * 1000,
    userId: user_id,
  });
};

export const refreshAccessToken = async (): Promise<void> => {
  const token = tokenStore.get();
  if (!token) throw new Error("No token stored. Please authenticate first.");

  const response = await axios.post(
    FITBIT_TOKEN_URL,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
    {
      headers: {
        Authorization: buildBasicAuth(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token, refresh_token, expires_in, user_id } = response.data;
  tokenStore.save({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: Date.now() + expires_in * 1000,
    userId: user_id,
  });
};

export const getValidAccessToken = async (): Promise<string> => {
  if (tokenStore.isExpired()) {
    await refreshAccessToken();
  }
  const token = tokenStore.get();
  if (!token) throw new Error("Authentication required.");
  return token.accessToken;
};
