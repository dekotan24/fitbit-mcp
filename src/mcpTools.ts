// src/mcpTools.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getSleepData, getSleepRange,
  getHeartRate, getHeartRateVariability,
  getDailyActivity, getActivityGoals, getLifetimeStats, getActivityLogs,
  getWeightLogs, getBodyFatLogs, getBodyGoals, getBodyTimeSeries,
  getSpO2, getBreathingRate, getSkinTemperature,
  getFoodLogs, getWaterLogs, getFoodGoals,
  getProfile, getDevices, getBadges,
  getMenstrualCycles, getCardioFitnessScore,
} from "./fitbitClient.js";
import { buildAuthUrl } from "./auth.js";
import { tokenStore } from "./tokenStore.js";

const dateParam = z.string().describe('日付 (YYYY-MM-DD) または "today"').default("today");

const toJson = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

const safeCall = async (fn: () => Promise<unknown>) => {
  try {
    return toJson(await fn());
  } catch (err: any) {
    return toJson({ error: err?.response?.data ?? err?.message ?? "Unknown error" });
  }
};

export const registerTools = (server: McpServer) => {
  // 認証
  server.tool("get_auth_url", "Fitbit認証URLを取得する", {}, async () => ({
    content: [{ type: "text", text: buildAuthUrl() }],
  }));

  server.tool("check_auth_status", "認証状態を確認する", {}, async () => {
    const token = tokenStore.get();
    const status = token
      ? `認証済み (UserID: ${token.userId}, 期限: ${new Date(token.expiresAt).toLocaleString("ja-JP")})`
      : "未認証。get_auth_url で認証してください。";
    return { content: [{ type: "text", text: status }] };
  });

  // 睡眠
  server.tool("get_sleep", "指定日の睡眠データを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getSleepData(date)));

  server.tool("get_sleep_range", "期間の睡眠データを取得する（最大100日）",
    { startDate: z.string().describe("開始日 (YYYY-MM-DD)"), endDate: z.string().describe("終了日 (YYYY-MM-DD)") },
    async ({ startDate, endDate }) => safeCall(() => getSleepRange(startDate, endDate)));

  // 心拍数
  server.tool("get_heart_rate", "指定日の心拍数データを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getHeartRate(date)));

  server.tool("get_heart_rate_variability", "心拍変動（HRV）データを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getHeartRateVariability(date)));

  // アクティビティ
  server.tool("get_activity", "指定日のアクティビティデータ（歩数・カロリー等）を取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getDailyActivity(date)));

  server.tool("get_activity_goals", "アクティビティ目標を取得する", {},
    async () => safeCall(() => getActivityGoals()));

  server.tool("get_lifetime_stats", "累計アクティビティ統計を取得する", {},
    async () => safeCall(() => getLifetimeStats()));

  server.tool("get_activity_logs", "エクササイズログを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getActivityLogs(date)));

  // 体重・体組成
  server.tool("get_weight", "体重ログを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getWeightLogs(date)));

  server.tool("get_body_fat", "体脂肪率ログを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getBodyFatLogs(date)));

  server.tool("get_body_goals", "体重目標を取得する", {},
    async () => safeCall(() => getBodyGoals()));

  server.tool("get_body_measurements", "身体計測データを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getBodyTimeSeries(date)));

  // 健康指標
  server.tool("get_spo2", "血中酸素濃度（SpO2）を取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getSpO2(date)));

  server.tool("get_breathing_rate", "呼吸数データを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getBreathingRate(date)));

  server.tool("get_skin_temperature", "皮膚温度データを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getSkinTemperature(date)));

  server.tool("get_cardio_fitness", "心肺フィットネス（VO2 Max）スコアを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getCardioFitnessScore(date)));

  // 栄養・水分
  server.tool("get_food_logs", "食事ログを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getFoodLogs(date)));

  server.tool("get_water_logs", "水分摂取ログを取得する", { date: dateParam },
    async ({ date }) => safeCall(() => getWaterLogs(date)));

  server.tool("get_food_goals", "栄養目標を取得する", {},
    async () => safeCall(() => getFoodGoals()));

  // プロフィール・デバイス
  server.tool("get_profile", "Fitbitプロフィール情報を取得する", {},
    async () => safeCall(() => getProfile()));

  server.tool("get_devices", "連携デバイス一覧を取得する", {},
    async () => safeCall(() => getDevices()));

  server.tool("get_badges", "獲得バッジ一覧を取得する", {},
    async () => safeCall(() => getBadges()));

  // 生理周期
  server.tool("get_menstrual_cycles", "生理周期データを取得する", {},
    async () => safeCall(() => getMenstrualCycles()));
};
