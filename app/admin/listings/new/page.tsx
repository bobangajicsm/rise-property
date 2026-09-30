import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPropertyEditor } from "@/components/admin/admin-property-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/admin-access";
import { getActiveAgents } from "@/lib/agents-store";
import { getPropertyTypeConfigurations } from "@/lib/property-types-store";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `New Listing | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNewListingPage() {
  const access = await getAdminAccess();

  if (!access) {
    redirect("/admin/login");
  }

  const [propertyTypes, allAgents] = await Promise.all([
    getPropertyTypeConfigurations(),
    getActiveAgents(),
  ]);
  const agents = access.role === "agent" ? [access.agent] : allAgents;

  return (
    <AdminShell
      current="new"
      title={access.role === "agent" ? "Create My Listing" : "Create Listing"}
      description={
        access.role === "agent"
          ? "Create a new listing assigned to your agent profile."
          : "Build a new property entry with media, map pinning, and full listing details."
      }
      viewerRole={access.role}
      viewerName={access.agent?.name}
      viewerLabel={access.agent?.role}
      viewerImage={access.agent?.image}
    >
      <AdminPropertyEditor
        propertyTypes={propertyTypes}
        agents={agents}
        viewerRole={access.role}
        lockedAgentId={access.agent?.id}
      />
    </AdminShell>
  );
}
