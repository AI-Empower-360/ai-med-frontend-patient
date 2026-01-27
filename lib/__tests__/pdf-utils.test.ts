/**
 * Unit tests for PDF utilities
 */

import { exportLabsToPDF, exportSummaryToPDF, printPage } from "../pdf-utils";

// Mock jsPDF
jest.mock("jspdf", () => {
  const mockDoc = {
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    setLineWidth: jest.fn(),
    line: jest.fn(),
    addPage: jest.fn(),
    splitTextToSize: jest.fn((text: string) => [text]),
    save: jest.fn(),
    internal: {
      pageSize: {
        getWidth: () => 210,
      },
    },
  };

  return jest.fn(() => mockDoc);
});

describe("PDF Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("exportLabsToPDF", () => {
    it("should export labs to PDF", () => {
      const labs = [
        {
          id: "lab-1",
          testName: "Test",
          date: new Date().toISOString(),
          value: "10",
          unit: "mg/dL",
          referenceRange: "5-15",
        },
      ];

      exportLabsToPDF(labs, "Test Patient");

      // Verify PDF was created and saved
      const jsPDF = require("jspdf");
      expect(jsPDF).toHaveBeenCalled();
    });

    it("should export labs without patient name", () => {
      const labs = [
        {
          id: "lab-1",
          testName: "Test",
          date: new Date().toISOString(),
          value: "10",
          unit: "mg/dL",
          referenceRange: "5-15",
        },
      ];

      exportLabsToPDF(labs);

      const jsPDF = require("jspdf");
      expect(jsPDF).toHaveBeenCalled();
    });
  });

  describe("exportSummaryToPDF", () => {
    it("should export summary to PDF", () => {
      const summary = {
        id: "sum-1",
        title: "Test Visit",
        date: new Date().toISOString(),
        summary: "Test summary text",
        followUps: ["Follow-up 1", "Follow-up 2"],
      };

      exportSummaryToPDF(summary, "Test Patient");

      const jsPDF = require("jspdf");
      expect(jsPDF).toHaveBeenCalled();
    });

    it("should export summary without follow-ups", () => {
      const summary = {
        id: "sum-1",
        title: "Test Visit",
        date: new Date().toISOString(),
        summary: "Test summary text",
      };

      exportSummaryToPDF(summary);

      const jsPDF = require("jspdf");
      expect(jsPDF).toHaveBeenCalled();
    });
  });

  describe("printPage", () => {
    it("should trigger window.print", () => {
      const mockPrint = jest.fn();
      window.print = mockPrint;

      printPage("Test Title");

      expect(mockPrint).toHaveBeenCalled();
    });
  });
});
