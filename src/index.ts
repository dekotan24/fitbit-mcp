// src/index.ts
import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { exchangeCodeForToken } from "./auth.js";
import { registerTools } from "./mcpTools.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const BASE_URL = "https://fitbit.fanet.work";

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

// OAuth discovery endpoints (claude.ai MCP required)
app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.json({
    resource: BASE_URL,
    authorization_servers: [BASE_URL],
  });
});

app.get("/.well-known/oauth-protected-resource/sse", (_req, res) => {
  res.json({
    resource: `${BASE_URL}/sse`,
    authorization_servers: [BASE_URL],
  });
});

app.get("/.well-known/oauth-authorization-server", (_req, res) => {
  res.json({
    issuer: BASE_URL,
    authorization_endpoint: `${BASE_URL}/callback`,
    token_endpoint: "https://api.fitbit.com/oauth2/token",
    registration_endpoint: `${BASE_URL}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
  });
});

app.post("/register", (_req, res) => {
  res.json({
    client_id: process.env.FITBIT_CLIENT_ID,
    client_secret: process.env.FITBIT_CLIENT_SECRET,
  });
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
  console.log(`📍 MCP endpoint: ${BASE_URL}/sse`);
  console.log(`🔐 OAuth callback: ${BASE_URL}/callback`);
});
