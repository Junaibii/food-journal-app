const TOKEN_KEY = "fj_auth_token";

export const storage = {
  async saveToken(token: string): Promise<void> {
    localStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return localStorage.getItem(TOKEN_KEY);
  },

  async deleteToken(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
  },
};
