import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminPropertyEditor } from "@/components/admin/admin-property-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAdminAccess,
  isPropertyOwnedByAgent,
} from "@/lib/admin-access";
import { getAgents } from "@/lib/agents-store";
import { getPropertyTypeConfigurations } from "@/lib/property-types-store";
import { getPropertyById } from "@/lib/properties-store";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Edit Listing | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminEditListingPage(
  props: PageProps<"/admin/listings/[id]">,
) {
  const access = await getAdminAccess();

  if (!access) {
    redirect("/admin/login");
  }

  const params = await props.params;
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const [property, propertyTypes, allAgents] = await Promise.all([
    getPropertyById(id),
    getPropertyTypeConfigurations(),
    getAgents({ includeInactive: true }),
  ]);

  if (!property) {
    notFound();
  }

  if (access.role === "agent" && !isPropertyOwnedByAgent(property, access.agent.id)) {
    notFound();
  }

  const agents = access.role === "agent" ? [access.agent] : allAgents;

  return (
    <AdminShell
      current="edit"
      title={access.role === "agent" ? "Edit My Listing" : "Edit Listing"}
      description={
        access.role === "agent"
          ? "Update the listing assigned to your profile."
          : "Refine content, update location data, and publish changes back to the live site."
      }
      viewerRole={access.role}
      viewerName={access.agent?.name}
      viewerLabel={access.agent?.role}
      viewerImage={access.agent?.image}
    >
      <AdminPropertyEditor
        property={property}
        propertyTypes={propertyTypes}
        agents={agents}
        viewerRole={access.role}
        lockedAgentId={access.agent?.id}
      />
    </AdminShell>
  );
}
