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

// 睡眠
export const getSleepData = async (date: string = "today") =>
  fitbitGet(`${BASE_URL_1_2}/user/-/sleep/date/${date}.json`);

export const getSleepRange = async (startDate: string, endDate: string) =>
  fitbitGet(`${BASE_URL_1_2}/user/-/sleep/date/${startDate}/${endDate}.json`);

// 心拍数
export const getHeartRate = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/activities/heart/date/${date}/1d.json`);

export const getHeartRateVariability = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/hrv/date/${date}.json`);

// アクティビティ
export const getDailyActivity = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/activities/date/${date}.json`);

export const getActivityGoals = async () =>
  fitbitGet(`${BASE_URL}/user/-/activities/goals/daily.json`);

export const getLifetimeStats = async () =>
  fitbitGet(`${BASE_URL}/user/-/activities.json`);

export const getActivityLogs = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/activities/list.json?afterDate=${date}&sort=asc&limit=20&offset=0`);

// 体重・体組成
export const getWeightLogs = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/body/log/weight/date/${date}.json`);

export const getBodyFatLogs = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/body/log/fat/date/${date}.json`);

export const getBodyGoals = async () =>
  fitbitGet(`${BASE_URL}/user/-/body/log/weight/goal.json`);

export const getBodyTimeSeries = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/body/date/${date}.json`);

// 血中酸素・呼吸・皮膚温度
export const getSpO2 = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/spo2/date/${date}.json`);

export const getBreathingRate = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/br/date/${date}.json`);

export const getSkinTemperature = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/temp/skin/date/${date}.json`);

// 栄養・水分
export const getFoodLogs = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/foods/log/date/${date}.json`);

export const getWaterLogs = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/foods/log/water/date/${date}.json`);

export const getFoodGoals = async () =>
  fitbitGet(`${BASE_URL}/user/-/foods/log/goal.json`);

// プロフィール・デバイス
export const getProfile = async () =>
  fitbitGet(`${BASE_URL}/user/-/profile.json`);

export const getDevices = async () =>
  fitbitGet(`${BASE_URL}/user/-/devices.json`);

export const getBadges = async () =>
  fitbitGet(`${BASE_URL}/user/-/badges.json`);

// 生理周期
export const getMenstrualCycles = async () =>
  fitbitGet(`${BASE_URL}/user/-/cycles-tracking/events.json`);

// VO2 Max (Cardio Fitness)
export const getCardioFitnessScore = async (date: string = "today") =>
  fitbitGet(`${BASE_URL}/user/-/cardioscore/date/${date}.json`);
