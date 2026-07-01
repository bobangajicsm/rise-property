import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAgentEditor } from "@/components/admin/admin-agent-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAgents } from "@/lib/agents-store";
import { getAllProperties } from "@/lib/properties-store";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `New Agent | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNewAgentPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [agents, properties] = await Promise.all([
    getAgents({ includeInactive: true }),
    getAllProperties({ includeDrafts: true }),
  ]);

  return (
    <AdminShell
      current="agent-new"
      title="Create Agent"
      description="Add a consultant profile for listing assignment and lead context."
    >
      <AdminAgentEditor agents={agents} properties={properties} />
    </AdminShell>
  );
}
