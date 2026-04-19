/**
 * Thin wrapper around expo-secure-store.
 *
 * Isolates the native module so the rest of the app stays testable
 * (jest mocks this module; production code never calls SecureStore directly).
 */
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "fj_auth_token";

export const storage = {
  /** Persist the JWT to the device keychain / secure enclave. */
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  /** Read the stored JWT, or null if nothing is saved. */
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  /** Remove the JWT on logout or token invalidation. */
  async deleteToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
