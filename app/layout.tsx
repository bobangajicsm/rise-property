import type { Metadata } from "next";
import { GDPRBanner } from "@/components/site/gdpr-banner";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: siteName,
  description: siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <GDPRBanner />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
