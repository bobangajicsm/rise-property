import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Admin Locations | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLocationsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  redirect("/admin");
}
