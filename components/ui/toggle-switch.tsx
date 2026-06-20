'use client';

import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
}

export function ToggleSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  onLabel = "On",
  offLabel = "Off",
}: ToggleSwitchProps) {
  return (
    <div className="rounded-[1.35rem] border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black">{label}</p>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              {description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            "relative mt-0.5 flex h-8 w-14 shrink-0 items-center rounded-full px-1 transition-all",
            checked ? "bg-accent" : "bg-gray-300",
          )}
        >
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-bold uppercase text-gray-500 shadow-sm transition-transform",
              checked ? "translate-x-6" : "translate-x-0",
            )}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] uppercase",
            checked ? "bg-accent/10 text-accent" : "bg-white text-gray-500",
          )}
        >
          {checked ? onLabel : offLabel}
        </span>
      </div>
    </div>
  );
}
