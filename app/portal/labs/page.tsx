"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type LabResult } from "@/lib/api-client";
import { Badge } from "@/shared/ui/badge";

export default function LabsPage() {
  const [labs, setLabs] = useState<LabResult[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        setError(e instanceof Error ? e.message : "Failed to load labs.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = labs || [];
    if (!q) return list;
    return list.filter((l) => l.testName.toLowerCase().includes(q));
  }, [labs, query]);

  return (
    <Card title="Lab results" className="h-full">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labs…"
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {labs === null ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-600">No lab results found.</div>
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

