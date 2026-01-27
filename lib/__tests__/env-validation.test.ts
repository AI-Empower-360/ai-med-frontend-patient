/**
 * Unit tests for environment validation
 */

import { getEnvConfig, getSafeEnvConfig } from "../env-validation";

// Mock process.env
const originalEnv = process.env;

describe("env-validation", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getEnvConfig", () => {
    it("should throw error if NEXT_PUBLIC_API_BASE_URL is missing", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      expect(() => getEnvConfig()).toThrow("NEXT_PUBLIC_API_BASE_URL is required");
    });

    it("should throw error if NEXT_PUBLIC_API_BASE_URL is invalid", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "not-a-valid-url";

      expect(() => getEnvConfig()).toThrow("Invalid NEXT_PUBLIC_API_BASE_URL format");
    });

    it("should return valid config with required variables", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001";

      const config = getEnvConfig();

      expect(config.apiBaseUrl).toBe("http://localhost:3001");
      expect(config.wsBaseUrl).toBe("ws://localhost:3001");
      expect(config.demoMode).toBe(false);
    });

    it("should parse demo mode correctly", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001";
      process.env.NEXT_PUBLIC_DEMO_MODE = "true";

      const config = getEnvConfig();

      expect(config.demoMode).toBe(true);
    });

    it("should use custom WebSocket URL if provided", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001";
      process.env.NEXT_PUBLIC_WS_BASE_URL = "ws://localhost:3002";

      const config = getEnvConfig();

      expect(config.wsBaseUrl).toBe("ws://localhost:3002");
    });

    it("should validate WebSocket URL format", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001";
      process.env.NEXT_PUBLIC_WS_BASE_URL = "http://invalid-ws-url";

      expect(() => getEnvConfig()).toThrow("WebSocket URL must use ws:// or wss://");
    });
  });

  describe("getSafeEnvConfig", () => {
    it("should return defaults if validation fails", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const config = getSafeEnvConfig();

      expect(config.apiBaseUrl).toBe("http://localhost:3001");
      expect(config.demoMode).toBe(true);
    });
  });
});
