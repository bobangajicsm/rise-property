'use client';

import { useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";
import { loginAdmin, loginAgent } from "@/app/actions";
import { cn } from "@/lib/utils";

type LoginMode = "admin" | "agent";

interface AdminLoginPanelProps {
  hasAdminError: boolean;
  hasAgentError: boolean;
}

const loginModes: Array<{
  key: LoginMode;
  label: string;
  icon: typeof ShieldCheck;
}> = [
  { key: "admin", label: "Admin", icon: ShieldCheck },
  { key: "agent", label: "Agent", icon: UserRound },
];

export function AdminLoginPanel({
  hasAdminError,
  hasAgentError,
}: AdminLoginPanelProps) {
  const [mode, setMode] = useState<LoginMode>(hasAgentError ? "agent" : "admin");
  const activeCopy =
    mode === "admin"
      ? {
          title: "Admin Portal",
          eyebrow: "Main Admin",
          description: "Full catalog, agents, publishing and configuration access.",
        }
      : {
          title: "Agent Access",
          eyebrow: "Agent Login",
          description: "Listing access limited to properties assigned to your profile.",
        };

  return (
    <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
      <div className="p-6 md:p-8">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-xl shadow-accent/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            {activeCopy.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white">
            {activeCopy.title}
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
            {activeCopy.description}
          </p>
        </div>

        <div className="mb-7 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/30 p-1">
          {loginModes.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all",
                  isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-white/50 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {mode === "admin" ? (
          <form action={loginAdmin} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-bold tracking-widest text-white/35 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@rise-property.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-4 pr-4 pl-12 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-accent/60 focus:bg-white/[0.09]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-bold tracking-widest text-white/35 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  required
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-4 pr-4 pl-12 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-accent/60 focus:bg-white/[0.09]"
                />
              </div>
            </div>

            {hasAdminError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-center text-[10px] font-bold tracking-wider text-red-300 uppercase">
                  Invalid admin credentials
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-accent py-4 text-[10px] font-bold tracking-[0.28em] text-white uppercase shadow-xl shadow-accent/20 transition-all hover:bg-accent/90"
            >
              Login As Admin
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        ) : (
          <form action={loginAgent} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-bold tracking-widest text-white/35 uppercase">
                Username
              </label>
              <div className="relative">
                <UserRound className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  required
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter agent username"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-4 pr-4 pl-12 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-accent/60 focus:bg-white/[0.09]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-bold tracking-widest text-white/35 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  required
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-4 pr-4 pl-12 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-accent/60 focus:bg-white/[0.09]"
                />
              </div>
            </div>

            {hasAgentError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-center text-[10px] font-bold tracking-wider text-red-300 uppercase">
                  Invalid agent credentials
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-[10px] font-bold tracking-[0.28em] text-black uppercase transition-all hover:bg-accent hover:text-white"
            >
              Login As Agent
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        )}

        <div className="mt-7 border-t border-white/5 pt-6 text-center">
          <p className="text-[9px] font-medium tracking-[0.3em] text-white/25 uppercase">
            Rise Property Group
          </p>
        </div>
      </div>
    </div>
  );
}
