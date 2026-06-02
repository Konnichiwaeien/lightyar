export interface StrapiImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  url: string;
}

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiNews {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // Rich text / Markdown from VK
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  vkUrl?: string;
  mainImage: StrapiMedia;
  gallery?: StrapiMedia[];
  tags?: StrapiTag[];
}

export interface StrapiBreed {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiColor {
  id: number;
  documentId: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiPet {
  id: number;
  documentId: string;
  name: string;
  status: 'shelter' | 'home';
  sex: 'male' | 'female';
  type: 'cat' | 'dog';
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  birthDate?: string;
  specialSigns?: string;
  weight?: number;
  height?: number;
  size?: 'small' | 'medium' | 'large';
  diet?: string;
  character?: string;
  chronicDiseases?: string;
  sterilized?: boolean;
  socialized?: boolean;
  undergoingTreatment?: boolean;
  comment?: string;
  descr?: string;
  shortDescr?: string;
  promoText?: string;
  activity?: number;
  friendliness?: number;
  trainability?: number;
  photos?: StrapiMedia[];
  dogBreed?: StrapiBreed | null;
  catBreed?: StrapiBreed | null;
  color?: StrapiColor | null;
  campaigns?: StrapiCampaign[];
  donations?: StrapiDonation[];
}

export interface StrapiDonation {
  id: number;
  documentId: string;
  donorName: string;
  amount: number;
  type: 'once' | 'monthly';
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  campaign?: StrapiCampaign | null;
  pet?: StrapiPet | null;
}

export interface StrapiCampaign {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  shortDesc: string;
  longDesc: string;
  total: number;
  current: number;
  deadline?: string | null;
  status: 'active' | 'closed';
  tag: string;
  images?: StrapiMedia[];
  pet?: StrapiPet | null;
  donations?: StrapiDonation[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiResponseCollection<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiResponseSingle<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export type { StrapiNews as News, StrapiPet as Pet, StrapiCampaign as Campaign, StrapiDonation as Donation };

