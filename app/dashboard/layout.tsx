import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Backwards-compatible route: the patient app uses /portal.
  void children;
  redirect("/portal");
}
