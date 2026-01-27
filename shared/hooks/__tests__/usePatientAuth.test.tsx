/**
 * Integration tests for usePatientAuth hook
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { usePatientAuth } from "../usePatientAuth";
import { authApi, setAuthToken, clearAuthToken } from "@/lib/api-client";

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: "/",
  query: {},
  asPath: "/",
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock API client
jest.mock("@/lib/api-client", () => ({
  ...jest.requireActual("@/lib/api-client"),
  authApi: {
    loginPatient: jest.fn(),
    logout: jest.fn(),
  },
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
  subscribeAuthToken: jest.fn((cb) => {
    // Return unsubscribe function
    return () => {};
  }),
}));

describe("usePatientAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require("@/lib/api-client").getAuthToken as jest.Mock).mockReturnValue(null);
  });

  it("should initialize with no authentication", () => {
    const { result } = renderHook(() => usePatientAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.patient).toBeNull();
  });

  it("should handle login successfully", async () => {
    const mockResponse = {
      token: "test-token",
      patient: {
        id: "patient-1",
        name: "Test Patient",
        email: "test@example.com",
      },
    };

    (authApi.loginPatient as jest.Mock).mockResolvedValue(mockResponse);
    (require("@/lib/api-client").setAuthToken as jest.Mock).mockImplementation(() => {
      // Simulate token being set
      (require("@/lib/api-client").getAuthToken as jest.Mock).mockReturnValue("test-token");
    });

    const { result } = renderHook(() => usePatientAuth());

    await act(async () => {
      const response = await result.current.login({
        email: "test@example.com",
        accessCode: "1234",
      });
      expect(response).toEqual(mockResponse);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    expect(result.current.patient).toEqual(mockResponse.patient);
    // Note: router.push is called in the component, not in the hook
    // The hook just returns the login function
  });

  it("should handle login errors", async () => {
    const mockError = new Error("Invalid credentials");
    (authApi.loginPatient as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => usePatientAuth());

    await act(async () => {
      await expect(
        result.current.login({
          email: "test@example.com",
          accessCode: "wrong",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should handle logout", () => {
    const { result } = renderHook(() => usePatientAuth());

    act(() => {
      result.current.logout();
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(clearAuthToken).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
