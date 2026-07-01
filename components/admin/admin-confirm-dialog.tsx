'use client';

import type { ReactNode } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminConfirmDialogVariant = "danger" | "primary" | "accent";

interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  eyebrow?: string;
  isPending?: boolean;
  confirmDisabled?: boolean;
  variant?: AdminConfirmDialogVariant;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

const variantStyles: Record<
  AdminConfirmDialogVariant,
  {
    icon: string;
    confirm: string;
  }
> = {
  danger: {
    icon: "bg-red-50 text-red-500",
    confirm: "bg-red-500 text-white hover:bg-red-600",
  },
  primary: {
    icon: "bg-black text-white",
    confirm: "bg-black text-white hover:bg-accent",
  },
  accent: {
    icon: "bg-accent/10 text-accent",
    confirm: "bg-accent text-white hover:bg-accent/90",
  },
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  eyebrow = "Confirm Action",
  isPending = false,
  confirmDisabled = false,
  variant = "primary",
  children,
  onCancel,
  onConfirm,
}: AdminConfirmDialogProps) {
  if (!open) {
    return null;
  }

  const styles = variantStyles[variant];

  function handleCancel() {
    if (!isPending) {
      onCancel();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[260] flex items-end justify-center bg-black/55 px-4 py-6 backdrop-blur-sm sm:items-center"
      onClick={handleCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-dialog-title"
        aria-describedby="admin-confirm-dialog-description"
        className="w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white p-5 text-black shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              styles.icon,
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close confirmation dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
          {eyebrow}
        </p>
        <h3
          id="admin-confirm-dialog-title"
          className="mt-2 font-display text-2xl font-bold text-black"
        >
          {title}
        </h3>
        <p
          id="admin-confirm-dialog-description"
          className="mt-3 text-sm leading-relaxed text-gray-500"
        >
          {description}
        </p>
        {children ? <div className="mt-5">{children}</div> : null}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-colors hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending || confirmDisabled}
            onClick={onConfirm}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              styles.confirm,
            )}
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
