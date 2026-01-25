"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";
import { patientApi, type Appointment, type LabResult, type Medication, type VisitSummary } from "@/lib/api-client";
import { Badge } from "@/shared/ui/badge";

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-sm text-gray-600">
      <div className="font-medium text-gray-900">{title}</div>
      <div className="mt-1">{body}</div>
    </div>
  );
}

export default function PortalOverviewPage() {
  const [labs, setLabs] = useState<LabResult[] | null>(null);
  const [meds, setMeds] = useState<Medication[] | null>(null);
  const [appts, setAppts] = useState<Appointment[] | null>(null);
  const [summaries, setSummaries] = useState<VisitSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const [labsRes, medsRes, apptsRes, sumsRes] = await Promise.all([
          patientApi.getLabs(),
          patientApi.getMedications(),
          patientApi.getAppointments(),
          patientApi.getSummaries(),
        ]);
        if (cancelled) return;
        setLabs(labsRes);
        setMeds(medsRes);
        setAppts(apptsRes);
        setSummaries(sumsRes);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load portal data.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const recentLabs = useMemo(() => (labs || []).slice(0, 3), [labs]);
  const activeMeds = useMemo(() => (meds || []).filter((m) => m.status === "active").slice(0, 4), [meds]);
  const nextAppts = useMemo(() => (appts || []).slice(0, 3), [appts]);
  const recentSummaries = useMemo(() => (summaries || []).slice(0, 2), [summaries]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Labs">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">{labs ? labs.length : "—"}</div>
            <Link href="/portal/labs" className="text-sm text-blue-700 hover:underline">
              View
            </Link>
          </div>
          <div className="mt-2 text-sm text-gray-600">Recent lab results</div>
        </Card>

        <Card title="Medications">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">{meds ? meds.length : "—"}</div>
            <Link href="/portal/medications" className="text-sm text-blue-700 hover:underline">
              View
            </Link>
          </div>
          <div className="mt-2 text-sm text-gray-600">Active and past medications</div>
        </Card>

        <Card title="Appointments">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">{appts ? appts.length : "—"}</div>
            <Link href="/portal/appointments" className="text-sm text-blue-700 hover:underline">
              View
            </Link>
          </div>
          <div className="mt-2 text-sm text-gray-600">Upcoming and past visits</div>
        </Card>

        <Card title="Summaries">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">{summaries ? summaries.length : "—"}</div>
            <Link href="/portal/summaries" className="text-sm text-blue-700 hover:underline">
              View
            </Link>
          </div>
          <div className="mt-2 text-sm text-gray-600">Visit and care summaries</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent labs"
          headerActions={
            <Link href="/portal/labs" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          }
        >
          {labs === null ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : recentLabs.length === 0 ? (
            <EmptyState title="No labs yet" body="Lab results will appear here when available." />
          ) : (
            <div className="space-y-3">
              {recentLabs.map((l) => (
                <div key={l.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{l.testName}</div>
                    <div className="text-xs text-gray-600">{new Date(l.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-900">
                      {l.value} {l.unit}
                    </div>
                    <Badge variant={l.flag === "high" ? "critical" : l.flag === "low" ? "warning" : "success"}>
                      {l.flag || "normal"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Active medications"
          headerActions={
            <Link href="/portal/medications" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          }
        >
          {meds === null ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : activeMeds.length === 0 ? (
            <EmptyState title="No active medications" body="Your active meds will appear here." />
          ) : (
            <div className="space-y-3">
              {activeMeds.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-600">
                      {m.dose} • {m.frequency}
                    </div>
                  </div>
                  <Badge variant="info">active</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Upcoming appointments"
          headerActions={
            <Link href="/portal/appointments" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          }
        >
          {appts === null ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : nextAppts.length === 0 ? (
            <EmptyState title="No appointments scheduled" body="Upcoming appointments will appear here." />
          ) : (
            <div className="space-y-3">
              {nextAppts.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{a.type}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(a.start).toLocaleString()} • {a.location}
                    </div>
                  </div>
                  <Badge variant={a.status === "scheduled" ? "success" : "warning"}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Recent summaries"
          headerActions={
            <Link href="/portal/summaries" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          }
        >
          {summaries === null ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : recentSummaries.length === 0 ? (
            <EmptyState title="No summaries yet" body="Visit summaries will appear here." />
          ) : (
            <div className="space-y-3">
              {recentSummaries.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{s.title}</div>
                    <div className="text-xs text-gray-600">{new Date(s.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2">{s.summary}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

