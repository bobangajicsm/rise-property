'use client';

import { useState, useTransition, type FormEvent } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  IdCard,
  KeyRound,
  LockKeyhole,
  LoaderCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { changeOwnPasswordAction } from "@/app/actions";
import { cn } from "@/lib/utils";

interface AdminProfileSecurityPanelProps {
  role: "admin" | "agent";
  name: string;
  label: string;
  image?: string;
  email?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const profileOptions = [
  {
    id: "details",
    label: "Profile Details",
    icon: IdCard,
    tone: "active",
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    tone: "active",
  },
  {
    id: "activity",
    label: "Login Activity",
    icon: Clock3,
    tone: "soon",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    tone: "soon",
  },
  {
    id: "two-factor",
    label: "Two-Factor Auth",
    icon: LockKeyhole,
    tone: "soon",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: SlidersHorizontal,
    tone: "soon",
  },
] as const;

export function AdminProfileSecurityPanel({
  role,
  name,
  label,
  image,
  email,
}: AdminProfileSecurityPanelProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();
  const accessLabel = role === "admin" ? "Full platform access" : "Assigned listings only";

  function submitPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (newPassword.length < 8) {
      setFeedbackTone("error");
      setFeedback("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedbackTone("error");
      setFeedback("New password and confirmation do not match.");
      return;
    }

    startTransition(async () => {
      try {
        await changeOwnPasswordAction({
          currentPassword,
          newPassword,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFeedbackTone("success");
        setFeedback("Password updated successfully.");
      } catch (error) {
        setFeedbackTone("error");
        setFeedback(
          error instanceof Error ? error.message : "Unable to update password.",
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-lg font-bold text-white">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              ) : (
                getInitials(name)
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                Account
              </p>
              <h3 className="mt-1 truncate font-display text-2xl font-bold text-black md:text-3xl">
                {name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-black px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
              {role === "admin" ? "Main Admin" : "Agent"}
            </span>
            <span className="rounded-full bg-accent/10 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
              Active
            </span>
          </div>
        </div>

        <div className="grid border-t border-black/6 sm:grid-cols-2 xl:grid-cols-3">
          {profileOptions.map((item) => {
            const Icon = item.icon;
            const isSoon = item.tone === "soon";

            return (
              <a
                key={item.id}
                href={isSoon ? undefined : `#${item.id}`}
                aria-disabled={isSoon}
                className={cn(
                  "flex min-h-20 items-center gap-3 border-black/6 px-5 py-4 text-left transition-colors sm:border-r xl:last:border-r-0",
                  isSoon
                    ? "cursor-default text-gray-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-black",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isSoon ? "bg-gray-50" : "bg-accent/10 text-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{item.label}</span>
                  {isSoon ? (
                    <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[8px] font-bold tracking-[0.16em] text-gray-400 uppercase">
                      Soon
                    </span>
                  ) : null}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section
        id="details"
        className="scroll-mt-24 rounded-[2rem] border border-black/5 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Profile Details
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-black">
              Account Overview
            </h3>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Display Name", name],
            ["Role", role === "admin" ? "Main Admin" : "Agent"],
            ["Access", accessLabel],
            ["Email", email || "Not set"],
          ].map(([itemLabel, value]) => (
            <div key={itemLabel} className="rounded-[1.35rem] bg-gray-50 p-4">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                {itemLabel}
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-black">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="security"
        className="scroll-mt-24 rounded-[2rem] border border-black/5 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Security
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-black">
              Change Password
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
              Only your own password can be changed here.
            </p>
          </div>
        </div>

        <form onSubmit={submitPasswordChange} className="space-y-4">
          <div>
            <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
              Current Password
            </label>
            <div className="relative">
              <KeyRound className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter current password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                New Password
              </label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                Confirm Password
              </label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repeat new password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
          </div>

          {feedback ? (
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm",
                feedbackTone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              {feedbackTone === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : null}
              {feedback}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
}
