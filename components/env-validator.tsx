"use client";

import { useEffect } from "react";
import { validateClientEnv } from "@/lib/env-validation";
import { validateBackendConnection } from "@/lib/backend-connection";

/**
 * Environment Validator Component
 * Validates environment configuration on app startup
 */
export function EnvValidator() {
  useEffect(() => {
    // Validate environment variables
    try {
      validateClientEnv();
    } catch (error) {
      // Error is already logged by validateClientEnv
      // In production, you might want to show a user-friendly error
      if (process.env.NODE_ENV === "production") {
        console.error("Environment validation failed. Please check your configuration.");
      }
    }

    // Test backend connection (non-blocking)
    validateBackendConnection().catch(() => {
      // Connection test failed, but don't block the app
      // Warnings are already logged
    });
  }, []);

  return null; // This component doesn't render anything
}
