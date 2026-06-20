import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPropertyTypeConfigurations } from "@/lib/property-types-store";
import { getAllProperties } from "@/lib/properties-store";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Admin | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [properties, propertyTypes] = await Promise.all([
    getAllProperties({ includeDrafts: true }),
    getPropertyTypeConfigurations(),
  ]);

  return (
    <AdminShell
      current="overview"
      title="Overview"
      description="Track the live catalog, review recent updates, and jump quickly into publishing."
    >
      <AdminOverview properties={properties} propertyTypes={propertyTypes} />
    </AdminShell>
  );
}
