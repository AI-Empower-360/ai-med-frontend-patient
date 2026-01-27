/**
 * Backend API Connection Validation
 * Tests connectivity to the backend API
 */

import { getSafeEnvConfig } from "./env-validation";

interface ConnectionStatus {
  connected: boolean;
  error?: string;
  apiUrl: string;
  demoMode: boolean;
}

/**
 * Test backend API connection
 */
export async function testBackendConnection(): Promise<ConnectionStatus> {
  const config = getSafeEnvConfig();

  // If demo mode is enabled, skip connection test
  if (config.demoMode) {
    return {
      connected: true,
      apiUrl: config.apiBaseUrl,
      demoMode: true,
    };
  }

  try {
    // Try to connect to a health endpoint (if available) or root
    const healthUrl = `${config.apiBaseUrl}/health`;
    const rootUrl = config.apiBaseUrl;

    let response: Response | null = null;

    // Try health endpoint first
    try {
      response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
    } catch {
      // If health endpoint fails, try root
      try {
        response = await fetch(rootUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000),
        });
      } catch (error) {
        throw new Error("Unable to reach backend API");
      }
    }

    if (!response.ok && response.status !== 404) {
      // 404 is acceptable (endpoint might not exist)
      throw new Error(`Backend responded with status ${response.status}`);
    }

    return {
      connected: true,
      apiUrl: config.apiBaseUrl,
      demoMode: false,
    };
  } catch (error) {
    return {
      connected: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error connecting to backend",
      apiUrl: config.apiBaseUrl,
      demoMode: false,
    };
  }
}

/**
 * Validate backend API is accessible (non-blocking)
 * Logs warnings but doesn't throw errors
 */
export async function validateBackendConnection(): Promise<void> {
  if (typeof window === "undefined") {
    return; // Server-side, skip validation
  }

  const status = await testBackendConnection();

  if (!status.connected && !status.demoMode) {
    console.warn(
      "⚠️  Backend API Connection Warning:",
      status.error || "Unable to connect to backend API"
    );
    console.warn(
      "📝 Please ensure:",
      "\n  1. Backend API is running",
      `\n  2. Backend URL is correct: ${status.apiUrl}`,
      "\n  3. CORS is properly configured on the backend",
      "\n  4. Network connectivity is available"
    );
    console.warn(
      "\n💡 Tip: Enable demo mode by setting NEXT_PUBLIC_DEMO_MODE=true in .env.local"
    );
  } else if (status.connected && !status.demoMode) {
    console.log("✅ Backend API connection successful:", status.apiUrl);
  }
}
