import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminListingsTable } from "@/components/admin/admin-listings-table";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
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
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const properties = await getAllProperties({ includeDrafts: true });

  return (
    <AdminShell
      current="listings"
      title="Manage Listings"
      description="Search, review, edit, draft, publish, and remove properties from the catalog."
    >
      <AdminListingsTable properties={properties} />
    </AdminShell>
  );
}
