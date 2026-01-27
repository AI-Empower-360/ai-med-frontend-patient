/**
 * PDF Export Utilities
 * HIPAA-compliant PDF generation for patient data
 */

import jsPDF from "jspdf";

/**
 * Export lab results to PDF
 */
export function exportLabsToPDF(
  labs: Array<{
    id: string;
    testName: string;
    date: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag?: "low" | "high";
  }>,
  patientName?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header
  doc.setFontSize(18);
  doc.text("Lab Results", margin, yPos);
  yPos += 10;

  if (patientName) {
    doc.setFontSize(12);
    doc.text(`Patient: ${patientName}`, margin, yPos);
    yPos += 8;
  }

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 15;

  // Table header
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  const colWidths = [60, 30, 25, 35, 20];
  const headers = ["Test Name", "Date", "Result", "Reference", "Flag"];
  let xPos = margin;

  headers.forEach((header, idx) => {
    doc.text(header, xPos, yPos);
    xPos += colWidths[idx];
  });

  yPos += 8;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Table rows
  doc.setFont(undefined, "normal");
  labs.forEach((lab) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    xPos = margin;
    const date = new Date(lab.date).toLocaleDateString();
    const result = `${lab.value} ${lab.unit}`;
    const flag = lab.flag || "normal";

    doc.text(lab.testName.substring(0, 25), xPos, yPos);
    xPos += colWidths[0];
    doc.text(date, xPos, yPos);
    xPos += colWidths[1];
    doc.text(result, xPos, yPos);
    xPos += colWidths[2];
    doc.text(lab.referenceRange, xPos, yPos);
    xPos += colWidths[3];
    doc.text(flag, xPos, yPos);

    yPos += 7;
  });

  doc.save(`lab-results-${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Export visit summary to PDF
 */
export function exportSummaryToPDF(
  summary: {
    id: string;
    title: string;
    date: string;
    summary: string;
    followUps?: string[];
  },
  patientName?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header
  doc.setFontSize(18);
  doc.text("Visit Summary", margin, yPos);
  yPos += 10;

  if (patientName) {
    doc.setFontSize(12);
    doc.text(`Patient: ${patientName}`, margin, yPos);
    yPos += 8;
  }

  doc.setFontSize(10);
  doc.text(`Date: ${new Date(summary.date).toLocaleDateString()}`, margin, yPos);
  yPos += 8;
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 15;

  // Title
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text(summary.title, margin, yPos);
  yPos += 10;

  // Summary text
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  const summaryLines = doc.splitTextToSize(summary.summary, pageWidth - 2 * margin);
  doc.text(summaryLines, margin, yPos);
  yPos += summaryLines.length * 6 + 10;

  // Follow-ups
  if (summary.followUps && summary.followUps.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Follow-up Actions", margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    summary.followUps.forEach((followUp) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`• ${followUp}`, margin + 5, yPos);
      yPos += 6;
    });
  }

  const filename = `visit-summary-${summary.title.toLowerCase().replace(/\s+/g, "-")}-${new Date(summary.date).toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

/**
 * Print utility - triggers browser print dialog
 */
export function printPage(title?: string): void {
  if (typeof window !== "undefined") {
    // Add print styles
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          margin: 1cm;
        }
        button, .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    if (title) {
      document.title = title;
    }

    window.print();

    // Clean up after a delay
    setTimeout(() => {
      document.head.removeChild(style);
      if (title) {
        document.title = "AI Med Patient Portal";
      }
    }, 1000);
  }
}
