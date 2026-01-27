/**
 * Unit tests for backend connection
 */

import { testBackendConnection, validateBackendConnection } from "../backend-connection";

// Mock environment validation
jest.mock("../env-validation", () => ({
  getSafeEnvConfig: () => ({
    apiBaseUrl: "http://localhost:3001",
    demoMode: false,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("backend-connection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("testBackendConnection", () => {
    it("should return connected status when backend is available", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const status = await testBackendConnection();

      expect(status.connected).toBe(true);
      expect(status.demoMode).toBe(false);
    });

    it("should return connected status in demo mode", async () => {
      jest.resetModules();
      jest.mock("../env-validation", () => ({
        getSafeEnvConfig: () => ({
          apiBaseUrl: "http://localhost:3001",
          demoMode: true,
        }),
      }));

      const { testBackendConnection: testConnection } = require("../backend-connection");
      const status = await testConnection();

      expect(status.connected).toBe(true);
      expect(status.demoMode).toBe(true);
    });

    it("should return disconnected status when backend is unavailable", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const status = await testBackendConnection();

      expect(status.connected).toBe(false);
      expect(status.error).toBeDefined();
    });

    it("should handle timeout errors", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 100);
        });
      });

      const status = await testBackendConnection();

      expect(status.connected).toBe(false);
    });
  });

  describe("validateBackendConnection", () => {
    it("should not throw errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Should not throw
      await expect(validateBackendConnection()).resolves.not.toThrow();
    });
  });
});
