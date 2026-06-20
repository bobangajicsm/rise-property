import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminPropertyEditor } from "@/components/admin/admin-property-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
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
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const params = await props.params;
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const [property, propertyTypes] = await Promise.all([
    getPropertyById(id),
    getPropertyTypeConfigurations(),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <AdminShell
      current="edit"
      title="Edit Listing"
      description="Refine content, update location data, and publish changes back to the live site."
    >
      <AdminPropertyEditor property={property} propertyTypes={propertyTypes} />
    </AdminShell>
  );
}
