import { BrandMark } from "@/components/home/brand-mark";
import { MapLoading } from "@/components/maps/map-loading";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { LISTING_TYPE_META, type ListingType } from "@/types/property";

interface PropertyListingSkeletonProps {
  type?: ListingType;
}

function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
      <div className="flex flex-col sm:flex-row">
        <SkeletonBlock className="aspect-[4/3] w-full shrink-0 sm:w-[40%] sm:aspect-auto" />
        <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
          <div>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-7 w-4/5 rounded-lg" />
                <SkeletonBlock className="h-4 w-3/5 rounded-lg" />
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="ml-auto h-6 w-28 rounded-lg" />
                <SkeletonBlock className="ml-auto h-3 w-16 rounded-lg" />
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3 border-y border-gray-50 py-3">
              <SkeletonBlock className="h-5 w-16 rounded-full" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-6 w-6 rounded-full" />
              <SkeletonBlock className="h-3 w-24 rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-8 w-16 rounded-full lg:hidden" />
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyListingSkeleton({
  type = "buy",
}: PropertyListingSkeletonProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <header className="sticky top-0 z-[100] border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 px-4 py-2.5 md:gap-6 md:px-6 md:py-4">
          <div className="shrink-0">
            <BrandMark className="origin-left scale-[0.65] md:scale-100" />
          </div>

          <div className="hidden shrink-0 rounded-lg bg-gray-100 p-1 sm:flex">
            <div
              className={`rounded-md px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase md:px-6 md:py-2 md:text-[10px] ${
                type === "buy" ? "bg-white text-black shadow-sm" : "text-gray-400"
              }`}
            >
              {LISTING_TYPE_META.buy.label}
            </div>
            <div
              className={`rounded-md px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase md:px-6 md:py-2 md:text-[10px] ${
                type === "rent" ? "bg-white text-black shadow-sm" : "text-gray-400"
              }`}
            >
              {LISTING_TYPE_META.rent.label}
            </div>
          </div>

          <div className="flex-1">
            <SkeletonBlock className="h-10 w-full rounded-full md:h-11" />
          </div>

          <SkeletonBlock className="h-9 w-9 rounded-full md:h-11 md:w-24 md:rounded-lg" />
        </div>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="w-full overflow-y-auto bg-gray-50/30 p-4 md:p-6 lg:w-[50%] xl:w-[55%]">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-28 rounded-lg" />
                <SkeletonBlock className="h-8 w-72 rounded-lg md:h-10 md:w-96" />
                <SkeletonBlock className="h-4 w-64 rounded-lg" />
              </div>
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-9 w-20 rounded-lg" />
                <SkeletonBlock className="h-4 w-24 rounded-lg" />
              </div>
            </div>

            <div className="grid gap-4 md:gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-[50%] xl:w-[45%]">
          <MapLoading />
        </div>
      </div>
    </div>
  );
}
