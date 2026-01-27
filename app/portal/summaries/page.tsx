"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type VisitSummary } from "@/lib/api-client";
import { DateRangeFilter } from "@/shared/ui/date-range-filter";
import { exportSummaryToPDF, printPage } from "@/lib/pdf-utils";
import { usePatientAuth } from "@/shared/hooks/usePatientAuth";

type SortOrder = "date-desc" | "date-asc";

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<VisitSummary[] | null>(null);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");
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
        const res = await patientApi.getSummaries();
        if (cancelled) return;
        setSummaries(res);
      } catch (e) {
        if (cancelled) return;
        // Improved error handling
        if (e instanceof Error) {
          setError(e.message || "Failed to load summaries. Please try again.");
        } else {
          setError("Failed to load summaries. Please try again.");
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading summaries:", e);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = summaries || [];

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.followUps?.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      list = list.filter((s) => {
        const summaryDate = new Date(s.date);
        if (dateRange.start && summaryDate < new Date(dateRange.start)) return false;
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include entire end date
          if (summaryDate > endDate) return false;
        }
        return true;
      });
    }

    // Sort by date
    list = [...list].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "date-desc" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [summaries, query, sortOrder, dateRange]);

  const handleExportPDF = (summary: VisitSummary) => {
    exportSummaryToPDF(summary, patient?.name);
  };

  const handlePrint = () => {
    printPage("Visit Summaries");
  };

  return (
    <Card
      title="Visit summaries"
      className="h-full print-content"
      headerActions={
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!filteredAndSorted || filteredAndSorted.length === 0}
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
            placeholder="Search summaries…"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <DateRangeFilter
            onDateRangeChange={(start, end) =>
              setDateRange({ start, end })
            }
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>

        {summaries === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-600">
              {query || dateRange.start || dateRange.end
                ? "No summaries match your filters."
                : "No summaries found."}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSorted.map((s) => {
              const summaryDate = new Date(s.date);
              const isRecent = Date.now() - summaryDate.getTime() < 90 * 24 * 60 * 60 * 1000; // 90 days

              return (
                <div
                  key={s.id}
                  className={`bg-white border rounded-xl p-5 ${
                    isRecent ? "border-blue-200 bg-blue-50/20" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="text-base font-semibold text-gray-900">{s.title}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-600 whitespace-nowrap">
                        {summaryDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExportPDF(s)}
                        className="no-print px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        title="Export to PDF"
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {s.summary}
                  </div>
                  {s.followUps && s.followUps.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Follow-up Actions
                      </div>
                      <ul className="space-y-1.5">
                        {s.followUps.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

