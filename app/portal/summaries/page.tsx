"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type VisitSummary } from "@/lib/api-client";

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<VisitSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setError(e instanceof Error ? e.message : "Failed to load summaries.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => summaries || [], [summaries]);

  return (
    <Card title="Visit summaries" className="h-full">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {summaries === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-gray-600">No summaries found.</div>
        ) : (
          <div className="space-y-3">
            {list.map((s) => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                  <div className="text-xs text-gray-600">{new Date(s.date).toLocaleDateString()}</div>
                </div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {s.summary}
                </div>
                {s.followUps?.length ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Follow-ups
                    </div>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {s.followUps.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

