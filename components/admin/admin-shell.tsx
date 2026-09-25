'use client';

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  IdCard,
  Layers,
  LockKeyhole,
  LogOut,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/app/actions";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: ReactNode;
  current:
    | "overview"
    | "listings"
    | "new"
    | "edit"
    | "agents"
    | "agent-new"
    | "agent-edit"
    | "profile";
  title: string;
  description: string;
  viewerRole?: "admin" | "agent";
  viewerName?: string;
  viewerLabel?: string;
  viewerImage?: string;
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
  {
    href: "/admin/agents",
    key: "agents",
    label: "Agents",
    icon: Users,
  },
] as const;

const editorSteps = [
  "Basic Info",
  "Location & Media",
  "Review & Save",
] as const;

const accountSoonItems = [
  { icon: Clock3, label: "Login Activity", text: "Device and session history" },
  { icon: Bell, label: "Notifications", text: "Lead and account alerts" },
  { icon: LockKeyhole, label: "Two-Factor Auth", text: "Extra sign-in protection" },
  { icon: SlidersHorizontal, label: "Preferences", text: "Personal admin settings" },
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface AccountMenuProps {
  align?: "left" | "right";
  compact?: boolean;
  placement?: "bottom" | "top";
  profileName: string;
  profileLabel: string;
  profileBadge: string;
  viewerImage?: string;
  viewerRole: "admin" | "agent";
}

function AccountAvatar({
  profileName,
  viewerImage,
  viewerRole,
  size = "md",
}: {
  profileName: string;
  viewerImage?: string;
  viewerRole: "admin" | "agent";
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black font-bold text-white",
        size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs",
      )}
    >
      {viewerImage ? (
        <img
          src={viewerImage}
          alt={profileName}
          className="h-full w-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
      ) : viewerRole === "admin" ? (
        <UserRound className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      ) : (
        getInitials(profileName)
      )}
    </span>
  );
}

function AccountMenu({
  align = "right",
  compact = false,
  placement = "bottom",
  profileName,
  profileLabel,
  profileBadge,
  viewerImage,
  viewerRole,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center rounded-2xl border border-black/6 bg-gray-50 text-left transition-colors hover:bg-gray-100",
          compact ? "justify-center p-2" : "gap-3 p-3",
        )}
        title="Account"
      >
        <AccountAvatar
          profileName={profileName}
          viewerImage={viewerImage}
          viewerRole={viewerRole}
          size={compact ? "sm" : "md"}
        />
        <span className={cn("min-w-0 flex-1", compact && "hidden")}>
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-black">
              {profileName}
            </span>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[8px] font-bold tracking-[0.16em] text-accent uppercase">
              {profileBadge}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-gray-500">
            {profileLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform",
            compact && "hidden",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className={cn(
            "absolute z-[1100] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.6rem] border border-black/8 bg-white p-2 shadow-2xl",
            align === "right" ? "right-0" : "left-0",
            placement === "top" ? "bottom-[calc(100%+0.75rem)]" : "top-[calc(100%+0.75rem)]",
          )}
        >
          <div className="border-b border-black/6 px-3 py-3">
            <p className="truncate text-sm font-bold text-black">{profileName}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500">{profileLabel}</p>
          </div>

          <div className="py-2">
            <Link
              href="/admin/profile#details"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-black"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <IdCard className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-black">Profile Details</span>
                <span className="mt-0.5 block truncate text-xs font-medium text-gray-500">
                  Name, role, email and access level
                </span>
              </span>
            </Link>

            <Link
              href="/admin/profile#security"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-black"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-black">Security</span>
                <span className="mt-0.5 block truncate text-xs font-medium text-gray-500">
                  Change your password safely
                </span>
              </span>
            </Link>

            <div className="mt-1 grid gap-1 border-t border-black/6 pt-2">
              {accountSoonItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-gray-400"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gray-500">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs">
                        {item.text}
                      </span>
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[8px] font-bold tracking-[0.16em] text-gray-400 uppercase">
                      Soon
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <form action={logoutAdmin} className="border-t border-black/6 pt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                <LogOut className="h-4 w-4" />
              </span>
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function AdminShell({
  children,
  current,
  title,
  viewerRole = "admin",
  viewerName,
  viewerLabel,
  viewerImage,
}: AdminShellProps) {
  const isCollapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarPreferenceSnapshot,
    () => false,
  );
  const isListingsActive = current === "listings" || current === "edit";
  const isAgentsActive =
    current === "agents" || current === "agent-new" || current === "agent-edit";
  const isEditor = current === "new" || current === "edit";
  const desktopSidebarWidth = isCollapsed ? 92 : 320;
  const visibleNavigationItems =
    viewerRole === "agent"
      ? navigationItems.filter((item) => item.key === "listings")
      : navigationItems;
  const profileName = viewerName ?? (viewerRole === "agent" ? "Agent" : "Main Admin");
  const profileLabel =
    viewerLabel ?? (viewerRole === "agent" ? "Assigned listings" : "Full admin access");
  const profileBadge = viewerRole === "agent" ? "Agent" : "Admin";

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
              {viewerRole === "agent" ? "Agent" : "Admin"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              {viewerRole === "agent"
                ? viewerName ?? "Assigned listing access."
                : "Clean listing management for the live catalog."}
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
          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.key === "listings"
                ? isListingsActive
                : item.key === "agents"
                  ? isAgentsActive
                : current === item.key;

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
          <AccountMenu
            align="left"
            compact={isCollapsed}
            placement="top"
            profileName={profileName}
            profileLabel={profileLabel}
            profileBadge={profileBadge}
            viewerImage={viewerImage}
            viewerRole={viewerRole}
          />
        </div>
      </aside>

      <div className="transition-[padding] duration-300 ease-out xl:pl-[var(--admin-sidebar-width)]">
        <header
          className="hidden xl:fixed xl:top-0 xl:right-0 xl:left-[var(--admin-sidebar-width)] xl:z-30 xl:block xl:border-b xl:border-black/6 xl:bg-white xl:transition-[left] xl:duration-300 xl:ease-out"
        >
          <div className="mx-auto max-w-[1480px] px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold text-black">
                {title}
              </h2>
              <div className="w-[18rem]">
                <AccountMenu
                  profileName={profileName}
                  profileLabel={profileLabel}
                  profileBadge={profileBadge}
                  viewerImage={viewerImage}
                  viewerRole={viewerRole}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-4 md:px-6 lg:px-8 xl:pt-[64px] xl:pb-8">
          <div className="xl:hidden">
            <div className="flex items-center justify-between gap-3 border border-black/6 bg-white px-4 py-3 shadow-sm">
              <h2 className="font-display text-lg font-bold text-black">
                {title}
              </h2>
              <div className="min-w-[3rem] max-w-[14rem]">
                <AccountMenu
                  compact
                  profileName={profileName}
                  profileLabel={profileLabel}
                  profileBadge={profileBadge}
                  viewerImage={viewerImage}
                  viewerRole={viewerRole}
                />
              </div>
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
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === "listings"
              ? isListingsActive
              : item.key === "agents"
                ? isAgentsActive
                : current === item.key;

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
      </nav>
    </div>
  );
}
