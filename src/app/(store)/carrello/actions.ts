"use server";

import { listPublishedProducts } from "@/lib/products/queries";

export type CartCatalogItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  isAvailable: boolean;
};

export async function loadCartCatalog(): Promise<CartCatalogItem[]> {
  const products = await listPublishedProducts();

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    isAvailable: product.isAvailable,
  }));
}
