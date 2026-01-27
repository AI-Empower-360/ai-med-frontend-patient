/**
 * Unit tests for API client
 */

import {
  authApi,
  patientApi,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  subscribeAuthToken,
  ApiError,
} from "../api-client";
import type {
  PatientLoginRequest,
  LabResult,
  Medication,
  Appointment,
  VisitSummary,
} from "../api-client";

// Mock environment validation
jest.mock("../env-validation", () => ({
  getSafeEnvConfig: () => ({
    apiBaseUrl: "http://localhost:3001",
    demoMode: false,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("api-client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthToken();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("Auth Token Management", () => {
    it("should set and get auth token", () => {
      setAuthToken("test-token");
      expect(getAuthToken()).toBe("test-token");
    });

    it("should clear auth token", () => {
      setAuthToken("test-token");
      clearAuthToken();
      expect(getAuthToken()).toBeNull();
    });

    it("should notify subscribers when token changes", () => {
      const listener = jest.fn();
      subscribeAuthToken(listener);

      setAuthToken("test-token");
      expect(listener).toHaveBeenCalledWith("test-token");

      clearAuthToken();
      expect(listener).toHaveBeenCalledWith(null);
    });

    it("should unsubscribe listeners", () => {
      const listener = jest.fn();
      const unsubscribe = subscribeAuthToken(listener);

      unsubscribe();
      setAuthToken("test-token");

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("ApiError", () => {
    it("should create error with message and status", () => {
      const error = new ApiError("Test error", 404, "NOT_FOUND");

      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.name).toBe("ApiError");
    });
  });

  describe("authApi", () => {
    describe("loginPatient", () => {
      it("should make POST request to login endpoint", async () => {
        const mockResponse: any = {
          token: "test-token",
          patient: {
            id: "patient-1",
            name: "Test Patient",
            email: "test@example.com",
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          headers: new Headers({ "content-type": "application/json" }),
        });

        const credentials: PatientLoginRequest = {
          email: "test@example.com",
          accessCode: "1234",
        };

        const result = await authApi.loginPatient(credentials);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:3001/auth/patient/login",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify(credentials),
          })
        );

        expect(result).toEqual(mockResponse);
        expect(getAuthToken()).toBe("test-token");
      });

      it("should handle login errors", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          json: async () => ({
            error: "Invalid credentials",
            message: "Email or access code is incorrect",
          }),
          headers: new Headers({ "content-type": "application/json" }),
        });

        const credentials: PatientLoginRequest = {
          email: "test@example.com",
          accessCode: "wrong",
        };

        await expect(authApi.loginPatient(credentials)).rejects.toThrow(ApiError);
        expect(getAuthToken()).toBeNull();
      });
    });

    describe("logout", () => {
      it("should clear auth token", () => {
        setAuthToken("test-token");
        authApi.logout();
        expect(getAuthToken()).toBeNull();
      });
    });
  });

  describe("patientApi", () => {
    beforeEach(() => {
      setAuthToken("test-token");
    });

    describe("getLabs", () => {
      it("should fetch labs with auth token", async () => {
        const mockLabs: LabResult[] = [
          {
            id: "lab-1",
            testName: "Test",
            date: new Date().toISOString(),
            value: "10",
            unit: "mg/dL",
            referenceRange: "5-15",
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockLabs,
          headers: new Headers({ "content-type": "application/json" }),
        });

        const result = await patientApi.getLabs();

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        expect(fetchCall[0]).toBe("http://localhost:3001/api/patient/labs");
        expect(fetchCall[1]).toMatchObject({
          headers: expect.any(Headers),
        });
        
        // Verify Authorization header was set
        const headers = fetchCall[1].headers as Headers;
        expect(headers.get("Authorization")).toBe("Bearer test-token");

        expect(result).toEqual(mockLabs);
      });

      it("should handle API errors", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          json: async () => ({ error: "Server error" }),
          headers: new Headers({ "content-type": "application/json" }),
        });

        await expect(patientApi.getLabs()).rejects.toThrow(ApiError);
      });
    });

    describe("getMedications", () => {
      it("should fetch medications", async () => {
        const mockMeds: Medication[] = [
          {
            id: "med-1",
            name: "Test Med",
            dose: "10mg",
            frequency: "Once daily",
            status: "active",
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockMeds,
          headers: new Headers({ "content-type": "application/json" }),
        });

        const result = await patientApi.getMedications();
        expect(result).toEqual(mockMeds);
      });
    });

    describe("getAppointments", () => {
      it("should fetch appointments", async () => {
        const mockAppts: Appointment[] = [
          {
            id: "appt-1",
            type: "Checkup",
            start: new Date().toISOString(),
            location: "Clinic",
            status: "scheduled",
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockAppts,
          headers: new Headers({ "content-type": "application/json" }),
        });

        const result = await patientApi.getAppointments();
        expect(result).toEqual(mockAppts);
      });
    });

    describe("getSummaries", () => {
      it("should fetch summaries", async () => {
        const mockSummaries: VisitSummary[] = [
          {
            id: "sum-1",
            title: "Visit",
            date: new Date().toISOString(),
            summary: "Test summary",
          },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockSummaries,
          headers: new Headers({ "content-type": "application/json" }),
        });

        const result = await patientApi.getSummaries();
        expect(result).toEqual(mockSummaries);
      });
    });
  });
});
