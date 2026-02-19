// src/tokenStore.ts
// シンプルなメモリ内トークンストレージ（本番ではDBやKVに移行推奨）

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

let storedToken: TokenData | null = null;

export const tokenStore = {
  save: (data: TokenData) => {
    storedToken = data;
  },

  get: (): TokenData | null => storedToken,

  isExpired: (): boolean => {
    if (!storedToken) return true;
    return Date.now() >= storedToken.expiresAt - 60_000; // 1分前に期限切れ扱い
  },

  clear: () => {
    storedToken = null;
  },
};
