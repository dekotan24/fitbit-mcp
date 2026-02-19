// src/mcpTools.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getSleepData,
  getSleepRange,
  getHeartRate,
  getDailyActivity,
  getProfile,
} from "./fitbitClient.js";
import { buildAuthUrl } from "./auth.js";
import { tokenStore } from "./tokenStore.js";

export const registerTools = (server: McpServer) => {
  server.tool(
    "get_auth_url",
    "Fitbit認証URLを取得する。初回または再認証が必要な場合に使用。",
    {},
    async () => ({
      content: [{ type: "text", text: buildAuthUrl() }],
    })
  );

  server.tool(
    "check_auth_status",
    "認証状態を確認する",
    {},
    async () => {
      const token = tokenStore.get();
      const status = token
        ? `認証済み (UserID: ${token.userId}, 期限: ${new Date(token.expiresAt).toLocaleString("ja-JP")})`
        : "未認証。get_auth_url で認証してください。";
      return { content: [{ type: "text", text: status }] };
    }
  );

  server.tool(
    "get_sleep",
    "指定日の睡眠データを取得する",
    { date: z.string().describe('日付 (YYYY-MM-DD) または "today"').default("today") },
    async ({ date }) => {
      const data = await getSleepData(date);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_sleep_range",
    "期間の睡眠データを取得する（最大100日）",
    {
      startDate: z.string().describe("開始日 (YYYY-MM-DD)"),
      endDate: z.string().describe("終了日 (YYYY-MM-DD)"),
    },
    async ({ startDate, endDate }) => {
      const data = await getSleepRange(startDate, endDate);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_heart_rate",
    "指定日の心拍数データを取得する",
    { date: z.string().describe('日付 (YYYY-MM-DD) または "today"').default("today") },
    async ({ date }) => {
      const data = await getHeartRate(date);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_activity",
    "指定日のアクティビティデータ（歩数・カロリー等）を取得する",
    { date: z.string().describe('日付 (YYYY-MM-DD) または "today"').default("today") },
    async ({ date }) => {
      const data = await getDailyActivity(date);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_profile",
    "Fitbitプロフィール情報を取得する",
    {},
    async () => {
      const data = await getProfile();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
};
