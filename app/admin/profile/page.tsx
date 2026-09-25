import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminProfileSecurityPanel } from "@/components/admin/admin-profile-security-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/admin-access";
import { getConfiguredAdminEmail } from "@/lib/admin-auth";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Profile & Security | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProfilePage() {
  const access = await getAdminAccess();

  if (!access) {
    redirect("/admin/login");
  }

  const profile =
    access.role === "agent"
      ? {
          name: access.agent.name,
          label: access.agent.role,
          image: access.agent.image,
          email: access.agent.email,
        }
      : {
          name: "Main Admin",
          label: "Full admin access",
          image: undefined,
          email: getConfiguredAdminEmail(),
        };

  return (
    <AdminShell
      current="profile"
      title="Profile & Security"
      description="Review your access level and update your own password."
      viewerRole={access.role}
      viewerName={profile.name}
      viewerLabel={profile.label}
      viewerImage={profile.image}
    >
      <AdminProfileSecurityPanel
        role={access.role}
        name={profile.name}
        label={profile.label}
        image={profile.image}
        email={profile.email}
      />
    </AdminShell>
  );
}
