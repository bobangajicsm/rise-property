import type { ReactNode } from "react";

interface LegalPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
  aside?: ReactNode;
}

export function LegalPageShell({
  eyebrow,
  title,
  description,
  lastUpdated,
  children,
  aside,
}: LegalPageShellProps) {
  return (
    <main className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <p className="mb-4 text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
              {eyebrow}
            </p>
            <h1 className="max-w-4xl font-display text-4xl font-bold text-black md:text-5xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
              {description}
            </p>
            <div className="mt-4 inline-flex rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-gray-500 uppercase">
              Last updated {lastUpdated}
            </div>

            <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600">
              {children}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-6">
              {aside}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
