import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  // Backwards-compatible route: the patient app uses /portal.
  redirect("/portal");
}
