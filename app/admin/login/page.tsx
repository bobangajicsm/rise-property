import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck, User } from "lucide-react";
import { loginAdmin } from "@/app/actions";
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

  const searchParams = await props.searchParams;
  const hasError = searchParams.error === "invalid";

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
          <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-accent/20 blur-[120px]" />
          <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-accent/10 blur-[120px]" />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl">
            <div className="p-8 md:p-12">
              <div className="mb-10 flex flex-col items-center">
                <div className="mb-8 flex h-20 w-20 rotate-3 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/80 shadow-2xl shadow-accent/20">
                  <ShieldCheck className="h-10 w-10 text-white" />
                </div>
                <h2 className="mb-3 text-center text-3xl font-display font-bold tracking-wider text-white uppercase">
                  Admin Portal
                </h2>
                <p className="text-center text-xs tracking-[0.2em] text-gray-500 uppercase">
                  Secure Management Access
                </p>
              </div>

              <form action={loginAdmin} className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      required
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="admin@rise-property.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 pr-4 pl-12 text-sm text-white outline-none transition-all placeholder:text-gray-700 focus:border-accent/50 focus:bg-white/[0.08]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    Security Key
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      required
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 pr-4 pl-12 text-sm text-white outline-none transition-all placeholder:text-gray-700 focus:border-accent/50 focus:bg-white/[0.08]"
                    />
                  </div>
                </div>

                {hasError ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-center text-[10px] font-bold tracking-wider text-red-400 uppercase">
                      Invalid email or password
                    </p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-accent py-5 text-[10px] font-bold tracking-[0.3em] text-white uppercase shadow-xl shadow-accent/20 transition-all hover:bg-accent/90"
                >
                  Authenticate
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <div className="mt-12 border-t border-white/5 pt-8 text-center">
                <p className="text-[9px] font-medium tracking-[0.3em] text-gray-600 uppercase">
                  Rise Property Group • Enterprise Security
                </p>
              </div>
            </div>
          </div>

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
