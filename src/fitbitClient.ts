// src/fitbitClient.ts
import axios from "axios";
import { getValidAccessToken } from "./auth.js";

const BASE_URL = "https://api.fitbit.com/1";
const BASE_URL_1_2 = "https://api.fitbit.com/1.2";

const fitbitGet = async (url: string) => {
  const token = await getValidAccessToken();
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 日付フォーマット: "today" or "YYYY-MM-DD"
export const getSleepData = async (date: string = "today") => {
  return fitbitGet(`${BASE_URL_1_2}/user/-/sleep/date/${date}.json`);
};

export const getSleepRange = async (startDate: string, endDate: string) => {
  return fitbitGet(
    `${BASE_URL_1_2}/user/-/sleep/date/${startDate}/${endDate}.json`
  );
};

export const getHeartRate = async (date: string = "today") => {
  return fitbitGet(
    `${BASE_URL}/user/-/activities/heart/date/${date}/1d.json`
  );
};

export const getDailyActivity = async (date: string = "today") => {
  return fitbitGet(`${BASE_URL}/user/-/activities/date/${date}.json`);
};

export const getProfile = async () => {
  return fitbitGet(`${BASE_URL}/user/-/profile.json`);
};
