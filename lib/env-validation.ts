/**
 * Environment Variable Validation
 * Validates required environment variables and provides helpful error messages
 */

interface EnvConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  demoMode: boolean;
  nodeEnv: string;
}

/**
 * Get and validate environment variables
 */
export function getEnvConfig(): EnvConfig {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const wsBaseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL;
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE;
  const nodeEnv = process.env.NODE_ENV || "development";

  // Validate API Base URL
  if (!apiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is required. Please set it in your .env.local file.\n" +
        "Example: NEXT_PUBLIC_API_BASE_URL=http://localhost:3001"
    );
  }

  // Validate URL format
  try {
    new URL(apiBaseUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_BASE_URL format: "${apiBaseUrl}". Must be a valid URL.\n` +
        "Example: http://localhost:3001 or https://api.example.com"
    );
  }

  // Determine WebSocket URL (use API URL if not specified)
  const finalWsBaseUrl = wsBaseUrl || apiBaseUrl.replace(/^http/, "ws");

  // Validate WebSocket URL format if provided
  if (wsBaseUrl) {
    try {
      const wsUrl = new URL(wsBaseUrl);
      if (!wsUrl.protocol.startsWith("ws")) {
        throw new Error("WebSocket URL must use ws:// or wss:// protocol");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("protocol")) {
        throw error;
      }
      throw new Error(
        `Invalid NEXT_PUBLIC_WS_BASE_URL format: "${wsBaseUrl}". Must be a valid WebSocket URL.\n` +
          "Example: ws://localhost:3001 or wss://api.example.com"
      );
    }
  }

  // Parse demo mode
  const isDemoMode =
    demoMode === "true" ||
    demoMode === "1" ||
    demoMode === "True" ||
    demoMode === "TRUE";

  return {
    apiBaseUrl,
    wsBaseUrl: finalWsBaseUrl,
    demoMode: isDemoMode,
    nodeEnv,
  };
}

/**
 * Validate environment on app startup (client-side)
 */
export function validateClientEnv(): void {
  if (typeof window === "undefined") {
    return; // Server-side, skip validation
  }

  try {
    const config = getEnvConfig();

    // Log configuration in development
    if (config.nodeEnv === "development") {
      console.log("🔧 Environment Configuration:", {
        apiBaseUrl: config.apiBaseUrl,
        wsBaseUrl: config.wsBaseUrl,
        demoMode: config.demoMode,
        nodeEnv: config.nodeEnv,
      });

      if (config.demoMode) {
        console.log(
          "⚠️  Demo mode is enabled. Using mock data. Backend API will not be called."
        );
      } else {
        console.log(
          "✅ Production mode. Will connect to backend API at:",
          config.apiBaseUrl
        );
      }
    }

    // Warn in production if demo mode is enabled
    if (config.nodeEnv === "production" && config.demoMode) {
      console.warn(
        "⚠️  WARNING: Demo mode is enabled in production! This should only be used for development."
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Environment Configuration Error:", error.message);
      console.error(
        "\n📝 Please check your .env.local file and ensure all required variables are set.\n" +
          "See .env.example for reference."
      );
    }
    throw error;
  }
}

/**
 * Get environment configuration (safe, returns defaults if validation fails)
 */
export function getSafeEnvConfig(): EnvConfig {
  try {
    return getEnvConfig();
  } catch {
    // Return safe defaults if validation fails
    return {
      apiBaseUrl: "http://localhost:3001",
      wsBaseUrl: "ws://localhost:3001",
      demoMode: true,
      nodeEnv: "development",
    };
  }
}
