import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminAgentEditor } from "@/components/admin/admin-agent-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAgents } from "@/lib/agents-store";
import { getAllProperties } from "@/lib/properties-store";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Edit Agent | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminEditAgentPage(
  props: PageProps<"/admin/agents/[id]">,
) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const params = await props.params;
  const [agents, properties] = await Promise.all([
    getAgents({ includeInactive: true }),
    getAllProperties({ includeDrafts: true }),
  ]);
  const agent = agents.find((entry) => entry.id === params.id);

  if (!agent) {
    notFound();
  }

  return (
    <AdminShell
      current="agent-edit"
      title="Edit Agent"
      description="Update consultant details, capabilities, and assigned listings."
    >
      <AdminAgentEditor
        agent={agent}
        agents={agents}
        properties={properties}
      />
    </AdminShell>
  );
}
