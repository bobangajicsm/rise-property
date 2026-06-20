import { buildSitemapEntries, escapeXml } from "@/lib/sitemap";

export const dynamic = "force-static";

export async function GET() {
  const entries = await buildSitemapEntries();
  const hasImages = entries.some((entry) => entry.images?.length);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${hasImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ""}>
${entries
  .map((entry) => {
    const images = (entry.images ?? [])
      .map(
        (image) =>
          `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`,
      )
      .join("\n");

    return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
${images ? `${images}\n` : ""}    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
