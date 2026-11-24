export type ProductImage = {
  id: string;
  src: string;
  alt: string;
};

export type ProductVideo = {
  id: string;
  watchUrl: string;
  embedUrl: string | null;
  platform: "youtube" | "tiktok";
};

export type ProductMedia =
  | ({ kind: "image" } & ProductImage)
  | ({ kind: "video" } & ProductVideo);

export type ProductFeature = {
  id: string;
  name: string;
  value: string;
};

export type PublishedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  shortDescription: string | null;
  description: string | null;
  isAvailable: boolean;
  availabilityNoticeEnabled: boolean;
  availabilityNoticeText: string | null;
  media: ProductMedia[];
  images: ProductImage[];
  features: ProductFeature[];
};

export type StorePublicSettings = {
  storeName: string;
  whatsappNumber: string | null;
  homepageIntro: string | null;
  unavailableMessage: string | null;
};
