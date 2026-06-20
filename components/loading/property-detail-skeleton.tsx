import { Footer } from "@/components/home/footer";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

function SuggestedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white">
      <SkeletonBlock className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-6 w-4/5 rounded-lg" />
          <SkeletonBlock className="h-4 w-3/5 rounded-lg" />
        </div>
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-4 w-24 rounded-lg" />
          <SkeletonBlock className="h-4 w-16 rounded-lg" />
        </div>
        <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
          <SkeletonBlock className="h-4 w-12 rounded-lg" />
          <SkeletonBlock className="h-4 w-12 rounded-lg" />
          <SkeletonBlock className="h-4 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <>
      <div className="min-h-screen bg-white">
        <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <SkeletonBlock className="h-4 w-28 rounded-lg" />
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-9 w-9 rounded-full" />
              <SkeletonBlock className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </nav>

        <main className="pt-24 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <SkeletonBlock className="h-6 w-20 rounded-sm" />
                <SkeletonBlock className="h-6 w-24 rounded-sm" />
              </div>
              <SkeletonBlock className="h-12 w-full max-w-3xl rounded-lg md:h-14" />
              <SkeletonBlock className="h-5 w-full max-w-2xl rounded-lg" />
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              <div className="space-y-12 lg:col-span-2">
                <SkeletonBlock className="-mx-6 aspect-[4/3] rounded-none sm:mx-0 sm:aspect-[16/9] sm:rounded-2xl" />

                <div className="rounded-[1.6rem] border border-gray-100 bg-white p-6 shadow-sm lg:hidden">
                  <SkeletonBlock className="mb-2 h-3 w-20 rounded-lg" />
                  <SkeletonBlock className="mb-5 h-10 w-48 rounded-lg" />
                  <div className="flex flex-wrap gap-2">
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <SkeletonBlock className="h-3 w-24 rounded-lg" />
                      <SkeletonBlock className="h-10 w-52 rounded-lg" />
                      <SkeletonBlock className="h-4 w-40 rounded-lg" />
                    </div>
                    <SkeletonBlock className="hidden h-24 w-36 rounded-2xl md:block" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-y border-gray-100 py-8 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="text-center">
                      <SkeletonBlock className="mx-auto mb-3 h-8 w-16 rounded-lg" />
                      <SkeletonBlock className="mx-auto h-3 w-20 rounded-lg" />
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <SkeletonBlock className="h-8 w-40 rounded-lg" />
                  <div className="space-y-3">
                    <SkeletonBlock className="h-4 w-full rounded-lg" />
                    <SkeletonBlock className="h-4 w-full rounded-lg" />
                    <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
                  </div>
                </div>

                <div className="space-y-6">
                  <SkeletonBlock className="h-8 w-56 rounded-lg" />
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 p-4"
                      >
                        <SkeletonBlock className="h-6 w-6 rounded-full" />
                        <SkeletonBlock className="h-4 w-40 rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl lg:block">
                  <SkeletonBlock className="mb-2 h-3 w-20 rounded-lg" />
                  <SkeletonBlock className="mb-6 h-12 w-56 rounded-lg" />
                  <div className="mb-5 flex flex-wrap gap-2">
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                    <SkeletonBlock className="h-6 w-28 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <SkeletonBlock className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <SkeletonBlock className="h-5 w-32 rounded-lg" />
                      <SkeletonBlock className="h-3 w-28 rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                  </div>
                </div>

                <SkeletonBlock className="aspect-square w-full rounded-2xl" />
              </div>
            </div>
          </div>

          <section className="mt-24 border-t border-gray-100 pt-24">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-12 space-y-3">
                <SkeletonBlock className="h-3 w-20 rounded-lg" />
                <SkeletonBlock className="h-10 w-96 max-w-full rounded-lg" />
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SuggestedCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>

          <section className="mt-24 px-6">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-black px-8 py-12 md:px-12 md:py-16">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div className="space-y-4">
                  <SkeletonBlock className="h-3 w-20 rounded-lg bg-white/10 from-white/10 via-white/20 to-white/10" />
                  <SkeletonBlock className="h-12 w-full max-w-2xl rounded-lg bg-white/10 from-white/10 via-white/20 to-white/10" />
                  <SkeletonBlock className="h-4 w-full max-w-xl rounded-lg bg-white/10 from-white/10 via-white/20 to-white/10" />
                </div>
                <div className="grid gap-3">
                  <SkeletonBlock className="h-12 w-full rounded-2xl bg-white/10 from-white/10 via-white/20 to-white/10" />
                  <SkeletonBlock className="h-12 w-full rounded-2xl bg-white/10 from-white/10 via-white/20 to-white/10" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
