/**
 * Tests for error boundary component
 */

import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

describe("ErrorBoundary", () => {
  it("should render children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render error message when error occurs", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalError;
  });
});
