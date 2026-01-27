"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type LabResult } from "@/lib/api-client";
import { Badge } from "@/shared/ui/badge";
import { DateRangeFilter } from "@/shared/ui/date-range-filter";
import { exportLabsToPDF, printPage } from "@/lib/pdf-utils";
import { usePatientAuth } from "@/shared/hooks/usePatientAuth";

export default function LabsPage() {
  const [labs, setLabs] = useState<LabResult[] | null>(null);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [error, setError] = useState<string | null>(null);
  const { patient } = usePatientAuth();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const res = await patientApi.getLabs();
        if (cancelled) return;
        setLabs(res);
      } catch (e) {
        if (cancelled) return;
        // Improved error handling
        if (e instanceof Error) {
          setError(e.message || "Failed to load labs. Please try again.");
        } else {
          setError("Failed to load labs. Please try again.");
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading labs:", e);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = labs || [];

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((l) => l.testName.toLowerCase().includes(q));
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      list = list.filter((l) => {
        const labDate = new Date(l.date);
        if (dateRange.start && labDate < new Date(dateRange.start)) return false;
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include entire end date
          if (labDate > endDate) return false;
        }
        return true;
      });
    }

    return list;
  }, [labs, query, dateRange]);

  const handleExportPDF = () => {
    if (filtered.length > 0) {
      exportLabsToPDF(filtered, patient?.name);
    }
  };

  const handlePrint = () => {
    printPage("Lab Results");
  };

  return (
    <Card
      title="Lab results"
      className="h-full print-content"
      headerActions={
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={!filtered || filtered.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📄 Export PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!filtered || filtered.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🖨️ Print
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3 no-print">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labs…"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <DateRangeFilter
            onDateRangeChange={(start, end) =>
              setDateRange({ start, end })
            }
          />
        </div>

        {labs === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-600">
            {query || dateRange.start || dateRange.end
              ? "No lab results match your filters."
              : "No lab results found."}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Test</th>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                  <th className="text-left font-medium px-4 py-3">Result</th>
                  <th className="text-left font-medium px-4 py-3">Reference</th>
                  <th className="text-left font-medium px-4 py-3">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((l) => (
                  <tr key={l.id} className="text-gray-800">
                    <td className="px-4 py-3 font-medium text-gray-900">{l.testName}</td>
                    <td className="px-4 py-3">{new Date(l.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {l.value} {l.unit}
                    </td>
                    <td className="px-4 py-3">{l.referenceRange}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          l.flag === "high"
                            ? "critical"
                            : l.flag === "low"
                              ? "warning"
                              : "success"
                        }
                      >
                        {l.flag || "normal"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

