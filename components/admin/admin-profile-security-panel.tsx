'use client';

import { useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
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
              Signed In
            </p>
            <h3 className="mt-1 truncate font-display text-2xl font-bold text-black">
              {name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[1.35rem] bg-gray-50 p-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
              Access Level
            </p>
            <p className="mt-2 text-sm font-semibold text-black">
              {role === "admin" ? "Main Admin" : "Agent"}
            </p>
          </div>
          {email ? (
            <div className="rounded-[1.35rem] bg-gray-50 p-4">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Email
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-black">
                {email}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
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
              Update only your own password. Admins can manage agent access from each agent profile.
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
