import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginPanel } from "@/components/admin/admin-login-panel";
import { isAgentAuthenticated } from "@/lib/agent-auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Admin Login | ${siteName}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage(
  props: PageProps<"/admin/login">,
) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  if (await isAgentAuthenticated()) {
    redirect("/admin/listings");
  }

  const searchParams = await props.searchParams;
  const hasError = searchParams.error === "invalid";
  const hasAgentError = searchParams.agentError === "invalid";

  return (
    <main className="min-h-screen bg-[#050505]">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <img
            src="/logo_on_dark_background_1.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.82))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,176,161,0.26),transparent_32%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white xl:p-16">
            <div>
              <p className="text-[10px] font-bold tracking-[0.34em] text-accent uppercase">
                Rise Property Group
              </p>
              <h1 className="mt-8 max-w-xl font-display text-5xl font-bold leading-[1.02]">
                Curated administration for a sharper real estate brand.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70">
                Every listing detail, map pin, image, and inquiry flow should
                feel considered. The admin portal is where that polish starts.
              </p>
            </div>

            <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-md">
              <p className="text-[10px] font-bold tracking-[0.24em] text-accent uppercase">
                Editorial Note
              </p>
              <p className="mt-5 text-2xl leading-relaxed text-white">
                “Luxury is not volume. It is restraint, confidence, and detail
                placed exactly where it matters.”
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden px-4 py-10 md:px-8">
          <AdminLoginPanel
            hasAdminError={hasError}
            hasAgentError={hasAgentError}
          />

          <Link
            href="/"
            className="absolute bottom-8 text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors hover:text-white"
          >
            Return To Website
          </Link>
        </section>
      </div>
    </main>
  );
}
