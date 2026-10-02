import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/preview", "/portal-preview/"] }, sitemap: "https://fourthform-marketing.vercel.app/sitemap.xml" };
}
