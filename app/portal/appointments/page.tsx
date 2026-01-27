"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type Appointment } from "@/lib/api-client";
import { Badge } from "@/shared/ui/badge";
import { DateRangeFilter } from "@/shared/ui/date-range-filter";
import { printPage } from "@/lib/pdf-utils";

type FilterStatus = "all" | "scheduled" | "completed" | "cancelled";
type SortOrder = "date-desc" | "date-asc";

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[] | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const res = await patientApi.getAppointments();
        if (cancelled) return;
        setAppts(res);
      } catch (e) {
        if (cancelled) return;
        // Improved error handling
        if (e instanceof Error) {
          setError(e.message || "Failed to load appointments. Please try again.");
        } else {
          setError("Failed to load appointments. Please try again.");
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading appointments:", e);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = appts || [];
    
    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.type.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          (a.provider && a.provider.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      list = list.filter((a) => {
        const appointmentDate = new Date(a.start);
        if (dateRange.start && appointmentDate < new Date(dateRange.start)) return false;
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include entire end date
          if (appointmentDate > endDate) return false;
        }
        return true;
      });
    }

    // Sort by date
    list = [...list].sort((a, b) => {
      const dateA = new Date(a.start).getTime();
      const dateB = new Date(b.start).getTime();
      return sortOrder === "date-desc" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [appts, query, statusFilter, sortOrder, dateRange]);

  const handlePrint = () => {
    printPage("Appointments");
  };

  const upcoming = useMemo(
    () => (appts || []).filter((a) => a.status === "scheduled" && new Date(a.start) > new Date()),
    [appts]
  );

  return (
    <Card
      title="Appointments"
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

        {/* Upcoming appointments summary */}
        {upcoming.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900">
              {upcoming.length} upcoming appointment{upcoming.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="flex flex-col gap-3 no-print">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search appointments…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <DateRangeFilter
              onDateRangeChange={(start, end) =>
                setDateRange({ start, end })
              }
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {appts === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-600">
              {query || statusFilter !== "all" || dateRange.start || dateRange.end
                ? "No appointments match your filters."
                : "No appointments found."}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSorted.map((a) => {
              const appointmentDate = new Date(a.start);
              const isUpcoming = a.status === "scheduled" && appointmentDate > new Date();
              const isPast = appointmentDate < new Date();

              return (
                <div
                  key={a.id}
                  className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row items-start justify-between gap-4 ${
                    isUpcoming ? "border-blue-200 bg-blue-50/30" : "border-gray-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {a.type}
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          <span className="font-medium">
                            {appointmentDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {" • "}
                          <span>
                            {appointmentDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          {" • "}
                          <span>{a.location}</span>
                        </div>
                        {a.provider && (
                          <div className="mt-1 text-xs text-gray-600">
                            Provider: {a.provider}
                          </div>
                        )}
                        {a.notes && (
                          <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-100">
                            {a.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end gap-2">
                    <Badge
                      variant={
                        a.status === "scheduled"
                          ? "success"
                          : a.status === "cancelled"
                            ? "critical"
                            : "info"
                      }
                    >
                      {a.status}
                    </Badge>
                    {isUpcoming && (
                      <span className="text-xs text-blue-600 font-medium">Upcoming</span>
                    )}
                    {isPast && a.status === "scheduled" && (
                      <span className="text-xs text-gray-500">Past</span>
                    )}
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

