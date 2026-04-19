/**
 * Auth persistence — unit tests for services/storage.ts and stores/auth.ts.
 *
 * expo-secure-store is mocked so tests run in Node (no native modules needed).
 */
import { storage } from "@/services/storage";
import { useAuthStore } from "@/stores/auth";

// ---------------------------------------------------------------------------
// Mock expo-secure-store
// ---------------------------------------------------------------------------
const store: Record<string, string> = {};

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(async (key: string, value: string) => {
    store[key] = value;
  }),
  getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete store[key];
  }),
}));

const SecureStore = jest.requireMock("expo-secure-store");

// ---------------------------------------------------------------------------
// Mock services/users to avoid real network calls in the store import chain
// ---------------------------------------------------------------------------
jest.mock("@/services/users", () => ({
  getMe: jest.fn(),
}));

const MOCK_USER = {
  id: "u-1",
  username: "reem",
  display_name: "Reem",
  bio: null,
  avatar_url: null,
  locale: "en" as const,
  is_founding_contributor: false,
  created_at: "2025-01-01T00:00:00Z",
};

// ---------------------------------------------------------------------------
// storage wrapper
// ---------------------------------------------------------------------------
describe("storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("saveToken writes to SecureStore under the expected key", async () => {
    await storage.saveToken("tok_abc");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "fj_auth_token",
      "tok_abc",
    );
  });

  it("getToken returns the saved token", async () => {
    store["fj_auth_token"] = "tok_abc";
    const result = await storage.getToken();
    expect(result).toBe("tok_abc");
  });

  it("getToken returns null when nothing is stored", async () => {
    const result = await storage.getToken();
    expect(result).toBeNull();
  });

  it("deleteToken removes the key", async () => {
    store["fj_auth_token"] = "tok_abc";
    await storage.deleteToken();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("fj_auth_token");
    expect(store["fj_auth_token"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// useAuthStore — persistence wiring
// ---------------------------------------------------------------------------
describe("useAuthStore — setAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
    useAuthStore.setState({ user: null, token: null, isLoading: false });
  });

  it("sets user and token in state", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok_login");
    expect(useAuthStore.getState().user).toEqual(MOCK_USER);
    expect(useAuthStore.getState().token).toBe("tok_login");
  });

  it("persists the token to SecureStore", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok_login");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "fj_auth_token",
      "tok_login",
    );
  });
});

describe("useAuthStore — restoreAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, token: null, isLoading: false });
  });

  it("sets user and token without writing to SecureStore", () => {
    useAuthStore.getState().restoreAuth(MOCK_USER, "tok_restored");
    expect(useAuthStore.getState().user).toEqual(MOCK_USER);
    expect(useAuthStore.getState().token).toBe("tok_restored");
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});

describe("useAuthStore — clearAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: MOCK_USER, token: "tok_active", isLoading: false });
  });

  it("clears user and token from state", () => {
    useAuthStore.getState().clearAuth();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("deletes the token from SecureStore", () => {
    useAuthStore.getState().clearAuth();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("fj_auth_token");
  });
});
