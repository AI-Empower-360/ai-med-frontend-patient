/**
 * Centralized Error Handling
 * Provides consistent error handling and user-friendly error messages
 */

import { ApiError } from "./api-client";

export interface ErrorInfo {
  message: string;
  status?: number;
  code?: string;
  userFriendly?: string;
  retryable?: boolean;
}

/**
 * Sanitize error message to prevent PHI exposure
 */
function sanitizeErrorMessage(message: string): string {
  // Remove any potential PHI patterns
  const sanitized = message
    .replace(/patient\s+id:?\s*\w+/gi, "[Patient ID]")
    .replace(/email:?\s*[\w.@-]+/gi, "[Email]")
    .replace(/name:?\s*[\w\s]+/gi, "[Name]")
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]"); // SSN pattern

  return sanitized;
}

/**
 * Convert error to user-friendly message
 */
export function getUserFriendlyError(error: unknown): ErrorInfo {
  // Handle ApiError
  if (error instanceof ApiError) {
    const sanitized = sanitizeErrorMessage(error.message);

    // Map common error codes to user-friendly messages
    const userFriendlyMessages: Record<number, string> = {
      400: "Invalid request. Please check your input and try again.",
      401: "Authentication failed. Please check your credentials and try again.",
      403: "You don't have permission to access this resource.",
      404: "The requested resource was not found.",
      500: "A server error occurred. Please try again later.",
      502: "Service temporarily unavailable. Please try again later.",
      503: "Service temporarily unavailable. Please try again later.",
    };

    return {
      message: sanitized,
      status: error.status,
      code: error.code,
      userFriendly:
        userFriendlyMessages[error.status] ||
        "An error occurred. Please try again.",
      retryable: error.status >= 500 || error.status === 0, // Network errors
    };
  }

  // Handle standard Error
  if (error instanceof Error) {
    const sanitized = sanitizeErrorMessage(error.message);

    return {
      message: sanitized,
      userFriendly: "An unexpected error occurred. Please try again.",
      retryable: true,
    };
  }

  // Handle unknown errors
  return {
    message: "Unknown error",
    userFriendly: "An unexpected error occurred. Please try again.",
    retryable: true,
  };
}

/**
 * Log error (without PHI) for debugging
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    const errorInfo = getUserFriendlyError(error);
    console.error(`[Error${context ? ` in ${context}` : ""}]`, {
      message: errorInfo.message,
      status: errorInfo.status,
      code: errorInfo.code,
    });
  }
  // In production, you might want to send to error tracking service
  // but ensure no PHI is included
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const errorInfo = getUserFriendlyError(error);
  return errorInfo.retryable ?? false;
}

/**
 * Get retry delay in milliseconds (exponential backoff)
 */
export function getRetryDelay(attempt: number, baseDelay = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
}
