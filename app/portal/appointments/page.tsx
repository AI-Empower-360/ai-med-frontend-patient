"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type Appointment } from "@/lib/api-client";
import { Badge } from "@/shared/ui/badge";

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[] | null>(null);
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
        setError(e instanceof Error ? e.message : "Failed to load appointments.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => appts || [], [appts]);

  return (
    <Card title="Appointments" className="h-full">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {appts === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-gray-600">No appointments found.</div>
        ) : (
          <div className="space-y-3">
            {list.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {a.type}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    {new Date(a.start).toLocaleString()} • {a.location}
                  </div>
                  {a.provider && (
                    <div className="mt-1 text-xs text-gray-600">
                      Provider: {a.provider}
                    </div>
                  )}
                  {a.notes && (
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                      {a.notes}
                    </div>
                  )}
                </div>
                <div className="shrink-0">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

