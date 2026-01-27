"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type Medication } from "@/lib/api-client";
import { Badge } from "@/shared/ui/badge";
import { printPage } from "@/lib/pdf-utils";

type FilterStatus = "active" | "inactive" | "all";

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[] | null>(null);
  const [show, setShow] = useState<FilterStatus>("active");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const res = await patientApi.getMedications();
        if (cancelled) return;
        setMeds(res);
      } catch (e) {
        if (cancelled) return;
        // Improved error handling
        if (e instanceof Error) {
          setError(e.message || "Failed to load medications. Please try again.");
        } else {
          setError("Failed to load medications. Please try again.");
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading medications:", e);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let items = meds || [];

    // Filter by status
    if (show !== "all") {
      items = items.filter((m) => m.status === show);
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.prescriber && m.prescriber.toLowerCase().includes(q))
      );
    }

    return items;
  }, [meds, show, query]);

  const activeCount = useMemo(
    () => (meds || []).filter((m) => m.status === "active").length,
    [meds]
  );

  const handlePrint = () => {
    printPage("Medications");
  };

  return (
    <Card
      title="Medications"
      className="h-full print-content"
      headerActions={
        <div className="flex items-center gap-2 no-print">
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

        {/* Active medications summary */}
        {activeCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm font-medium text-green-900">
              {activeCount} active medication{activeCount !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="flex flex-col gap-3 no-print">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medications…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShow("active")}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                show === "active"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setShow("inactive")}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                show === "inactive"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              Inactive
            </button>
            <button
              type="button"
              onClick={() => setShow("all")}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                show === "all"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              All
            </button>
          </div>
        </div>

        {meds === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-600">
              {query || show !== "all"
                ? "No medications match your filters."
                : "No medications to show."}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => {
              const isActive = m.status === "active";
              const startDate = m.startDate ? new Date(m.startDate) : null;
              const endDate = m.endDate ? new Date(m.endDate) : null;

              return (
                <div
                  key={m.id}
                  className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row items-start justify-between gap-4 ${
                    isActive ? "border-green-200 bg-green-50/20" : "border-gray-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="text-base font-semibold text-gray-900">
                          {m.name}
                        </div>
                        <div className="mt-1.5 text-sm text-gray-700">
                          <span className="font-medium">{m.dose}</span>
                          {" • "}
                          <span>{m.frequency}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-gray-600">
                          {m.prescriber && (
                            <div>
                              <span className="font-medium">Prescriber:</span> {m.prescriber}
                            </div>
                          )}
                          {startDate && (
                            <div>
                              <span className="font-medium">Started:</span>{" "}
                              {startDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          )}
                          {endDate && (
                            <div>
                              <span className="font-medium">Ended:</span>{" "}
                              {endDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Badge variant={isActive ? "success" : "info"}>
                      {m.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

