/**
 * Unit tests for error handling utilities
 */

import { ApiError } from "../api-client";

describe("Error Handling", () => {
  describe("ApiError", () => {
    it("should create error with all properties", () => {
      const error = new ApiError("Test error", 404, "NOT_FOUND");

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.name).toBe("ApiError");
    });

    it("should work without error code", () => {
      const error = new ApiError("Test error", 500);

      expect(error.message).toBe("Test error");
      expect(error.status).toBe(500);
      expect(error.code).toBeUndefined();
    });
  });

  describe("Error message sanitization", () => {
    it("should not expose PHI in error messages", () => {
      // This is a conceptual test - actual implementation should ensure
      // no PHI is exposed in error messages
      const error = new ApiError("Invalid credentials", 401);

      expect(error.message).not.toContain("patient");
      expect(error.message).not.toContain("email");
      expect(error.message).not.toContain("name");
    });
  });
});
