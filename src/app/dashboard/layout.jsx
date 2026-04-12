import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import DashboardShell from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }) {
  const session = await getAuthSession();

  if (!session || !session.accessToken || session.error) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={session.user}
      pageTitle="Dashboard"
      breadcrumbItems={[{ title: "Home" }, { title: "Dashboard" }]}
    >
      {children}
    </DashboardShell>
  );
}
