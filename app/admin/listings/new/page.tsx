import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPropertyEditor } from "@/components/admin/admin-property-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
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
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const propertyTypes = await getPropertyTypeConfigurations();

  return (
    <AdminShell
      current="new"
      title="Create Listing"
      description="Build a new property entry with media, map pinning, and full listing details."
    >
      <AdminPropertyEditor propertyTypes={propertyTypes} />
    </AdminShell>
  );
}
