# fitbit-mcp

Fitbit データを Claude から取得できる MCP サーバー

## セットアップ

### 1. 環境変数の設定

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

`.env` を編集：

```
FITBIT_CLIENT_ID=23V2MJ
FITBIT_CLIENT_SECRET=your_client_secret
FITBIT_REDIRECT_URI=https://fitbit.fanet.work/callback
PORT=3000
```

### 2. インストール & ビルド

```bash
npm install
npm run build
npm start
```

## Railway へのデプロイ

1. Railway で新規プロジェクト作成
2. GitHub リポジトリと連携
3. 環境変数を Railway の Variables に設定
4. デプロイ後、`https://あなたのURL/sse` を claude.ai のカスタムコネクタに登録

## 初回認証

1. Claude に「get_auth_url ツールを使って」と指示
2. 返ってきた URL をブラウザで開く
3. Fitbit でログイン・許可
4. 「認証成功」ページが表示されれば OK

## 利用可能なツール

| ツール名 | 説明 |
|---------|------|
| `get_auth_url` | OAuth 認証 URL 取得 |
| `check_auth_status` | 認証状態確認 |
| `get_sleep` | 指定日の睡眠データ |
| `get_sleep_range` | 期間の睡眠データ |
| `get_heart_rate` | 心拍数データ |
| `get_activity` | 歩数・アクティビティ |
| `get_profile` | プロフィール情報 |
