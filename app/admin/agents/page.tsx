import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAgentsTable } from "@/components/admin/admin-agents-table";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAgents } from "@/lib/agents-store";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Admin Agents | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAgentsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const agents = await getAgents({ includeInactive: true });

  return (
    <AdminShell
      current="agents"
      title="Manage Agents"
      description="Create, update, and assign consultant profiles."
    >
      <AdminAgentsTable agents={agents} />
    </AdminShell>
  );
}
