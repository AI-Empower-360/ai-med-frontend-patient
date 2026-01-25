"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type Medication } from "@/lib/api-client";
import { Badge } from "@/shared/ui/badge";

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[] | null>(null);
  const [show, setShow] = useState<"active" | "all">("active");
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
        setError(e instanceof Error ? e.message : "Failed to load medications.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    const items = meds || [];
    if (show === "all") return items;
    return items.filter((m) => m.status === "active");
  }, [meds, show]);

  return (
    <Card title="Medications" className="h-full">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShow("active")}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium border",
              show === "active"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setShow("all")}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium border",
              show === "all"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            All
          </button>
        </div>

        {meds === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-gray-600">No medications to show.</div>
        ) : (
          <div className="space-y-3">
            {list.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {m.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    {m.dose} • {m.frequency}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Prescriber: {m.prescriber || "—"} • Started:{" "}
                    {m.startDate ? new Date(m.startDate).toLocaleDateString() : "—"}
                    {m.endDate ? ` • Ended: ${new Date(m.endDate).toLocaleDateString()}` : ""}
                  </div>
                </div>
                <div className="shrink-0">
                  <Badge variant={m.status === "active" ? "success" : "info"}>
                    {m.status}
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

