"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePatientAuth } from "@/shared/hooks/usePatientAuth";

const navItems = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/labs", label: "Labs" },
  { href: "/portal/medications", label: "Medications" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/summaries", label: "Summaries" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { patient, logout } = usePatientAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-bold text-gray-900">AI Med Patient Portal</div>
            <div className="text-sm text-gray-500">Read-only</div>
          </div>
          <div className="flex items-center gap-4">
            {patient?.name && (
              <div className="text-sm text-gray-700">
                Signed in as <span className="font-medium">{patient.name}</span>
              </div>
            )}
            <button
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <nav className="bg-white border border-gray-200 rounded-xl p-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "block rounded-lg px-3 py-2 text-sm font-medium",
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}

