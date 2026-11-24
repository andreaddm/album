import type { MetadataRoute } from "next";
import { listPublishedProducts } from "@/lib/products/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const products = await listPublishedProducts();

  return [
    { url: siteUrl },
    { url: `${siteUrl}/prodotti` },
    { url: `${siteUrl}/chi-siamo` },
    { url: `${siteUrl}/contatti` },
    { url: `${siteUrl}/privacy` },
    { url: `${siteUrl}/cookie` },
    ...products.map((product) => ({
      url: `${siteUrl}/prodotti/${product.slug}`,
    })),
  ];
}
