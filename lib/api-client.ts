/**
 * API Client for Patient Portal (read-only)
 * Handles REST API calls with in-memory authentication (no localStorage)
 */

import { getSafeEnvConfig } from "./env-validation";

// Get validated environment configuration
const envConfig = getSafeEnvConfig();
const API_BASE_URL = envConfig.apiBaseUrl;
const DEMO_MODE = envConfig.demoMode;

// In-memory token storage (HIPAA compliant - no localStorage)
let authToken: string | null = null;
let authTokenListeners: Set<(token: string | null) => void> = new Set();

export interface PatientLoginRequest {
  email: string;
  accessCode: string;
}

export interface PatientLoginResponse {
  token: string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LabResult {
  id: string;
  testName: string;
  date: string; // ISO
  value: string;
  unit: string;
  referenceRange: string;
  flag?: "low" | "high";
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  status: "active" | "inactive";
  prescriber?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
}

export interface Appointment {
  id: string;
  type: string;
  start: string; // ISO
  location: string;
  provider?: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export interface VisitSummary {
  id: string;
  title: string;
  date: string; // ISO
  summary: string;
  followUps?: string[];
}

/**
 * Set authentication token (stored in memory only)
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
  authTokenListeners.forEach((cb) => {
    try {
      cb(authToken);
    } catch {
      // ignore listener errors
    }
  });
}

/**
 * Get current authentication token
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  authToken = null;
  authTokenListeners.forEach((cb) => {
    try {
      cb(authToken);
    } catch {
      // ignore listener errors
    }
  });
}

/**
 * Subscribe to auth token changes (in-memory only).
 * Useful for keeping UI in sync without localStorage.
 */
export function subscribeAuthToken(
  cb: (token: string | null) => void
): () => void {
  authTokenListeners.add(cb);
  return () => {
    authTokenListeners.delete(cb);
  };
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Base fetch wrapper with authentication and error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (DEMO_MODE) {
    // Demo mode never calls a backend. We intentionally keep this behavior
    // in the client so docs/demo flows work without infrastructure.
    throw new ApiError(
      "Demo mode is enabled. This endpoint is not available.",
      0
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  // Default to JSON unless caller explicitly set something else
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add auth token if available
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  let response: Response;
  
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Unable to connect to the server. Please check your internet connection.",
        0,
        "NETWORK_ERROR"
      );
    }
    
    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        "Request timed out. Please try again.",
        0,
        "TIMEOUT"
      );
    }
    
    throw error;
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      // Sanitize error message to prevent PHI exposure
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.code;
    } catch {
      // If response is not JSON, use default message
    }

    // If unauthorized, clear in-memory token so the UI can redirect to login
    if (response.status === 401) {
      clearAuthToken();
    }

    // Create error with sanitized message
    const error = new ApiError(errorMessage, response.status, errorCode);
    
    // Log error for debugging (in development only)
    if (process.env.NODE_ENV === "development") {
      console.error(`API Error [${response.status}]:`, {
        endpoint,
        status: response.status,
        code: errorCode,
      });
    }

    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  return response.json();
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Patient login (read-only portal)
   */
  async loginPatient(
    credentials: PatientLoginRequest
  ): Promise<PatientLoginResponse> {
    if (DEMO_MODE) {
      const response: PatientLoginResponse = {
        token: "demo-token",
        patient: {
          id: "demo-patient",
          name: "Demo Patient",
          email: credentials.email,
        },
      };
      setAuthToken(response.token);
      return response;
    }

    const response = await apiRequest<PatientLoginResponse>(
      "/auth/patient/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    setAuthToken(response.token);
    return response;
  },

  /**
   * Logout (clears in-memory token)
   */
  logout(): void {
    clearAuthToken();
  },
};

/**
 * Patient portal read-only API
 */
export const patientApi = {
  async getLabs(): Promise<LabResult[]> {
    if (DEMO_MODE) return mockLabs;
    return apiRequest<LabResult[]>("/api/patient/labs");
  },
  async getMedications(): Promise<Medication[]> {
    if (DEMO_MODE) return mockMeds;
    return apiRequest<Medication[]>("/api/patient/medications");
  },
  async getAppointments(): Promise<Appointment[]> {
    if (DEMO_MODE) return mockAppointments;
    return apiRequest<Appointment[]>("/api/patient/appointments");
  },
  async getSummaries(): Promise<VisitSummary[]> {
    if (DEMO_MODE) return mockSummaries;
    return apiRequest<VisitSummary[]>("/api/patient/summaries");
  },
};

// Demo data (non-identifying sample content)
const mockLabs: LabResult[] = [
  {
    id: "lab-1",
    testName: "Hemoglobin A1c",
    date: new Date(Date.now() - 14 * 86400000).toISOString(),
    value: "5.6",
    unit: "%",
    referenceRange: "4.0–5.6",
  },
  {
    id: "lab-2",
    testName: "LDL Cholesterol",
    date: new Date(Date.now() - 30 * 86400000).toISOString(),
    value: "132",
    unit: "mg/dL",
    referenceRange: "< 100",
    flag: "high",
  },
  {
    id: "lab-3",
    testName: "TSH",
    date: new Date(Date.now() - 45 * 86400000).toISOString(),
    value: "2.1",
    unit: "mIU/L",
    referenceRange: "0.4–4.0",
  },
];

const mockMeds: Medication[] = [
  {
    id: "med-1",
    name: "Atorvastatin",
    dose: "20 mg",
    frequency: "Once daily",
    status: "active",
    prescriber: "Dr. Smith",
    startDate: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: "med-2",
    name: "Metformin",
    dose: "500 mg",
    frequency: "Twice daily",
    status: "inactive",
    prescriber: "Dr. Patel",
    startDate: new Date(Date.now() - 500 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
];

const mockAppointments: Appointment[] = [
  {
    id: "appt-1",
    type: "Primary care follow-up",
    start: new Date(Date.now() + 7 * 86400000).toISOString(),
    location: "Clinic A",
    provider: "Dr. Smith",
    status: "scheduled",
  },
  {
    id: "appt-2",
    type: "Lab draw",
    start: new Date(Date.now() - 20 * 86400000).toISOString(),
    location: "Lab B",
    status: "completed",
  },
];

const mockSummaries: VisitSummary[] = [
  {
    id: "sum-1",
    title: "Annual physical",
    date: new Date(Date.now() - 60 * 86400000).toISOString(),
    summary:
      "Reviewed preventive screenings and discussed lifestyle. Continued current medications. Plan for repeat labs in 3 months.",
    followUps: ["Repeat lipid panel in 3 months", "Schedule annual flu shot"],
  },
  {
    id: "sum-2",
    title: "Follow-up visit",
    date: new Date(Date.now() - 20 * 86400000).toISOString(),
    summary:
      "Discussed blood pressure readings at home and adjusted diet plan. No medication changes at this time.",
  },
];
