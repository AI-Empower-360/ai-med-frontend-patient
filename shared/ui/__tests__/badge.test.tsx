/**
 * Unit tests for Badge component
 */

import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("should render with default variant", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("should render with success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
  });

  it("should render with critical variant", () => {
    render(<Badge variant="critical">Critical</Badge>);
    const badge = screen.getByText("Critical");
    expect(badge).toHaveClass("bg-red-100", "text-red-800");
  });

  it("should render with warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
  });

  it("should render with info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge).toHaveClass("bg-blue-100", "text-blue-800");
  });

  it("should apply custom className", () => {
    render(<Badge className="custom-class">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge).toHaveClass("custom-class");
  });
});
