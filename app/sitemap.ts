import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zowkins.com";
  const routes = [
    "/",
    "/about",
    "/services",
    "/contact",
    "/cart",
    "/laptops",
    "/laptops/hp",
    "/laptops/dell",
    "/laptops/lenovo",
    "/laptops/asus",
    "/laptops/apple",
    "/desktops",
    "/desktops/hp",
    "/desktops/lenovo",
    "/accessories",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
