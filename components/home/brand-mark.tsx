import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  tone?: "light" | "dark";
  variant?: "default" | "header";
  className?: string;
}

export function BrandMark({
  tone = "dark",
  variant = "default",
  className,
}: BrandMarkProps) {
  const logoSrc =
    tone === "light"
      ? "/logo/colour%20inverted.png"
      : "/logo/colour.png";

  if (variant === "header") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center",
          className,
        )}
      >
        <div className="relative h-12 w-[142px] shrink-0 md:h-14 md:w-[164px]">
          <Image
            src={logoSrc}
            alt="Rise Property"
            fill
            sizes="164px"
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-12 w-[132px]", className)}>
      <Image
        src={logoSrc}
        alt="Rise Property"
        fill
        sizes="132px"
        className="object-contain"
        priority={tone === "dark"}
      />
    </div>
  );
}
