import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminListingsTable } from "@/components/admin/admin-listings-table";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAdminAccess,
  isPropertyOwnedByAgent,
} from "@/lib/admin-access";
import { getAgents } from "@/lib/agents-store";
import { getAllProperties } from "@/lib/properties-store";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Admin Listings | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminListingsPage() {
  const access = await getAdminAccess();

  if (!access) {
    redirect("/admin/login");
  }

  const [allProperties, agents] = await Promise.all([
    getAllProperties({ includeDrafts: true }),
    getAgents({ includeInactive: true }),
  ]);
  const properties =
    access.role === "agent"
      ? allProperties.filter((property) =>
          isPropertyOwnedByAgent(property, access.agent.id),
        )
      : allProperties;

  return (
    <AdminShell
      current="listings"
      title={access.role === "agent" ? "My Listings" : "Manage Listings"}
      description={
        access.role === "agent"
          ? "Review and update listings assigned to your profile."
          : "Search, review, edit, draft, publish, and remove properties from the catalog."
      }
      viewerRole={access.role}
      viewerName={access.agent?.name}
      viewerLabel={access.agent?.role}
      viewerImage={access.agent?.image}
    >
      <AdminListingsTable
        properties={properties}
        agents={agents}
        viewerRole={access.role}
      />
    </AdminShell>
  );
}
