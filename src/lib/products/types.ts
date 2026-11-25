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
  isFeatured: boolean;
  availabilityNoticeEnabled: boolean;
  availabilityNoticeText: string | null;
  media: ProductMedia[];
  images: ProductImage[];
  features: ProductFeature[];
};

export type HomepageCopyItem = {
  title: string;
  text: string;
};

export type StorePublicSettings = {
  storeName: string;
  whatsappNumber: string | null;
  homepageHeadline: string | null;
  homepageIntro: string | null;
  unavailableMessage: string | null;
  featuredLimit: 3 | 6 | 9;
  homepageEyebrow: string | null;
  homepageCtaCatalog: string | null;
  homepageCtaHow: string | null;
  homepageFeaturedTitle: string | null;
  homepageHowTitle: string | null;
  homepageHowSteps: HomepageCopyItem[];
  homepageWhyTitle: string | null;
  homepageWhyItems: HomepageCopyItem[];
  homepageWhyCta: string | null;
  privacyTitle: string | null;
  privacyBody: string | null;
  cookieTitle: string | null;
  cookieBody: string | null;
  aboutTitle: string | null;
  aboutBody: string | null;
};
