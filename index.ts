// src/index.ts
import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { exchangeCodeForToken } from "./auth.js";
import { registerTools } from "./mcpTools.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3000", 10);

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

// MCP SSEエンドポイント
const transports: Record<string, SSEServerTransport> = {};

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;

  const server = new McpServer({
    name: "fitbit-mcp",
    version: "1.0.0",
  });

  registerTools(server);
  await server.connect(transport);

  req.on("close", () => {
    delete transports[sessionId];
  });
});

app.post("/messages", express.json(), async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];

  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 Fitbit MCP Server running on port ${PORT}`);
  console.log(`📍 MCP SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`🔐 OAuth callback: http://localhost:${PORT}/callback`);
});
