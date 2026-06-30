import type { MetadataRoute } from "next";
import { CALCULATORS, getAllCategories } from "@/lib/calculators";

const BASE_URL = "https://fincalcpro.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/calculators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const categoryPages: MetadataRoute.Sitemap = getAllCategories().map(cat => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const calculatorPages: MetadataRoute.Sitemap = CALCULATORS.map(calc => ({
    url: `${BASE_URL}/calculator/${calc.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: calc.featured ? 0.9 : calc.popular ? 0.8 : 0.7,
  }));

  return [...staticPages, ...categoryPages, ...calculatorPages];
}
