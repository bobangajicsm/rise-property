'use client';

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  LogOut,
  Plus,
} from "lucide-react";
import { logoutAdmin } from "@/app/actions";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: ReactNode;
  current: "overview" | "listings" | "new" | "edit";
  title: string;
  description: string;
}

const navigationItems = [
  {
    href: "/admin",
    key: "overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    href: "/admin/listings",
    key: "listings",
    label: "Listings",
    icon: Layers,
  },
  {
    href: "/admin/listings/new",
    key: "new",
    label: "Create",
    icon: Plus,
  },
] as const;

const editorSteps = [
  "Basic Info",
  "Location & Media",
  "Review & Save",
] as const;

const SIDEBAR_STORAGE_KEY = "rise-admin-sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "rise-admin-sidebar-toggle";

function subscribeToSidebarPreference(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onChange();

  window.addEventListener("storage", handler);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, handler);
  };
}

function getSidebarPreferenceSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

export function AdminShell({
  children,
  current,
  title,
}: AdminShellProps) {
  const isCollapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarPreferenceSnapshot,
    () => false,
  );
  const isListingsActive = current === "listings" || current === "edit";
  const isEditor = current === "new" || current === "edit";
  const desktopSidebarWidth = isCollapsed ? 92 : 320;

  function toggleSidebar() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(!isCollapsed),
    );
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  }

  return (
    <div
      className="min-h-screen bg-[#f3f5f7] pb-28 xl:pb-0"
      style={{ ["--admin-sidebar-width" as string]: `${desktopSidebarWidth}px` }}
    >
      <aside
        className="hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-40 xl:flex xl:flex-col xl:border-r xl:border-black/6 xl:bg-white xl:transition-[width] xl:duration-300 xl:ease-out"
        style={{ width: desktopSidebarWidth }}
      >
        <div
          className={cn(
            "flex items-start border-b border-black/6 py-7 transition-[padding] duration-300 ease-out",
            isCollapsed ? "justify-center px-4" : "justify-between px-7",
          )}
        >
          <div className={cn("min-w-0 transition-all duration-300", isCollapsed && "hidden")}>
            <p className="text-[10px] font-bold tracking-[0.34em] text-accent uppercase">
              Rise Property
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold text-black">
              Admin
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Clean listing management for the live catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav
          className={cn(
            "flex-1 space-y-2 py-6 transition-[padding] duration-300 ease-out",
            isCollapsed ? "px-3" : "px-5",
          )}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.key === "listings" ? isListingsActive : current === item.key;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex rounded-2xl py-3 text-sm font-semibold transition-all duration-300 ease-out",
                  isCollapsed ? "justify-center px-3" : "items-center gap-3 px-4",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-black",
                )}
              >
                <Icon className="h-4 w-4" />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out",
                    isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "border-t border-black/6 py-5 transition-[padding] duration-300 ease-out",
            isCollapsed ? "px-3" : "px-5",
          )}
        >
          <form action={logoutAdmin}>
            <button
              type="submit"
              title="Logout"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
            >
              <LogOut className="h-4 w-4" />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out",
                  isCollapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100",
                )}
              >
                Logout
              </span>
            </button>
          </form>
        </div>
      </aside>

      <div className="transition-[padding] duration-300 ease-out xl:pl-[var(--admin-sidebar-width)]">
        <header
          className="hidden xl:fixed xl:top-0 xl:right-0 xl:left-[var(--admin-sidebar-width)] xl:z-30 xl:block xl:border-b xl:border-black/6 xl:bg-white xl:transition-[left] xl:duration-300 xl:ease-out"
        >
          <div className="mx-auto max-w-[1480px] px-8 py-3">
            <h2 className="font-display text-lg font-bold text-black">
              {title}
            </h2>
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-4 md:px-6 lg:px-8 xl:pt-[64px] xl:pb-8">
          <div className="xl:hidden">
            <div className="border border-black/6 bg-white px-4 py-3 shadow-sm">
              <h2 className="font-display text-lg font-bold text-black">
                {title}
              </h2>
            </div>
          </div>

          {isEditor ? (
            <div className="mt-4 rounded-[1.5rem] border border-black/6 bg-white px-4 py-4 shadow-sm xl:mt-0">
              <div className="flex flex-wrap gap-2">
                {editorSteps.map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      "rounded-full px-3 py-2 text-[10px] font-bold tracking-[0.18em] uppercase",
                      index === editorSteps.length - 1
                        ? "bg-gray-100 text-gray-500"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    {index + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4">{children}</div>
        </main>
      </div>

      <nav className="fixed right-4 bottom-4 left-4 z-[1000] flex items-center justify-between rounded-[1.5rem] border border-black/8 bg-white px-5 py-4 shadow-xl xl:hidden">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === "listings" ? isListingsActive : current === item.key;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-colors",
                isActive ? "text-accent" : "text-gray-400",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="flex flex-col items-center gap-1.5 text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase">
              Exit
            </span>
          </button>
        </form>
      </nav>
    </div>
  );
}
