// src/index.ts
import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { exchangeCodeForToken } from "./auth.js";
import { registerTools } from "./mcpTools.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3000", 10);

app.use(express.json());

// OAuth callbackエンドポイント
app.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    res.status(400).send(`認証エラー: ${error}`);
    return;
  }

  if (!code) {
    res.status(400).send("認証コードがありません");
    return;
  }

  try {
    await exchangeCodeForToken(code);
    res.send(`
      <html>
        <body style="font-family:sans-serif;text-align:center;padding:50px">
          <h1>✅ 認証成功！</h1>
          <p>このウィンドウを閉じてClaudeに戻ってください。</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Token exchange failed:", err);
    res.status(500).send("トークン取得に失敗しました");
  }
});

// ヘルスチェック
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// MCP Streamable HTTPエンドポイント
app.all("/sse", async (req, res) => {
  try {
    const server = new McpServer({
      name: "fitbit-mcp",
      version: "1.0.0",
    });

    registerTools(server);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// プロセスクラッシュ防止
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Fitbit MCP Server running on port ${PORT}`);
  console.log(`📍 MCP endpoint: https://fitbit.fanet.work/sse`);
  console.log(`🔐 OAuth callback: https://fitbit.fanet.work/callback`);
});
