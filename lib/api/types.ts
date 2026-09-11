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
  mime?: string | null;
  ext?: string | null;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  url: string;
}

export type StrapiNewsAttachmentKind = "video" | "audio" | "file";
export type StrapiNewsAttachmentProvider = "upload" | "direct" | "vk" | "other";

export interface StrapiNewsAttachment {
  id?: number;
  kind: StrapiNewsAttachmentKind;
  provider: StrapiNewsAttachmentProvider;
  title: string;
  description?: string | null;
  transcript?: string | null;
  media?: StrapiMedia | null;
  externalUrl?: string | null;
  poster?: StrapiMedia | null;
  captions?: StrapiMedia | null;
  duration?: number | null;
  order?: number | null;
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
  attachments?: StrapiNewsAttachment[];
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
  petStatus: 'shelter' | 'home';
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

export interface StrapiFile {
  id: number;
  documentId?: string;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  ext?: string | null;
  mime?: string | null;
  size?: number | string | null;
  url: string;
}

export type StrapiQualifier = "exact" | "atLeast" | "approximately";

export interface StrapiFinancialSummary {
  id?: number;
  currency: "RUB";
  income?: number | string | null;
  targetExpenses?: number | string | null;
  operatingExpenses?: number | string | null;
  bankFees?: number | string | null;
  closingBalance?: number | string | null;
  note?: string | null;
}

export interface StrapiOutcomeMetric {
  id?: number;
  kind: "dogsInCare" | "catsInCare" | "rescued" | "treated" | "adopted" | "volunteers";
  value: number | string;
  qualifier: StrapiQualifier;
  note?: string | null;
  order?: number | null;
}

export interface StrapiCustomMetric {
  id?: number;
  label: string;
  value: number | string;
  qualifier: StrapiQualifier;
  unit?: string | null;
  note?: string | null;
  order?: number | null;
}

export interface StrapiReportDocument {
  id?: number;
  title: string;
  documentType: "ministryReport" | "charityReport" | "financialStatement" | "audit" | "other";
  file?: StrapiFile | null;
  note?: string | null;
  order?: number | null;
}

/** Карточка доверия: утверждение о фонде, которого нет в цифрах. */
export interface StrapiTrustNote {
  id?: number;
  title: string;
  text: string;
  highlight?: string | null;
}

export interface StrapiAnnualReport {
  id: number;
  documentId: string;
  year: number;
  title: string;
  summary: string;
  body?: string | null;
  coverImage?: StrapiMedia | null;
  financialSummary?: StrapiFinancialSummary | null;
  fundingNote?: StrapiTrustNote | null;
  teamNote?: StrapiTrustNote | null;
  outcomes?: StrapiOutcomeMetric[] | null;
  customMetrics?: StrapiCustomMetric[] | null;
  documents?: StrapiReportDocument[] | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface StrapiAboutStatistic {
  id?: number;
  label: string;
  value: number | string;
  qualifier: StrapiQualifier;
  unit?: string | null;
  order?: number | null;
}

export interface StrapiAboutTeamMember {
  id?: number;
  name: string;
  role: string;
  city?: string | null;
  bio?: string | null;
  quote?: string | null;
  photo?: StrapiMedia | null;
  order?: number | null;
}

export interface StrapiAboutFaqItem {
  id?: number;
  question: string;
  answer: string;
  order?: number | null;
}

export interface StrapiAboutPage {
  id: number;
  documentId: string;
  heroTitle?: string | null;
  heroIntro?: string | null;
  heroVideo?: StrapiMedia | null;
  heroPoster?: StrapiMedia | null;
  missionTitle?: string | null;
  missionBody?: string | null;
  directionsImage?: StrapiMedia | null;
  historyTitle?: string | null;
  historyBody?: string | null;
  historyImage?: StrapiMedia | null;
  currentStats?: StrapiAboutStatistic[] | null;
  teamMembers?: StrapiAboutTeamMember[] | null;
  resultsTitle?: string | null;
  resultsBody?: string | null;
  resultsImage?: StrapiMedia | null;
  volunteerTitle?: string | null;
  volunteerBody?: string | null;
  volunteerVideo?: StrapiMedia | null;
  volunteerPoster?: StrapiMedia | null;
  faqItems?: StrapiAboutFaqItem[] | null;
  faqImage?: StrapiMedia | null;
  reportsTitle?: string | null;
  reportsBody?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface StrapiSiteMedia {
  id: number;
  documentId: string;
  homeAboutImage?: StrapiMedia | null;
  directionsImage?: StrapiMedia | null;
  historyImage?: StrapiMedia | null;
  marinaPhoto?: StrapiMedia | null;
  svetlanaPhoto?: StrapiMedia | null;
  andreyPhoto?: StrapiMedia | null;
  resultsImage?: StrapiMedia | null;
  faqImage?: StrapiMedia | null;
  heroVideo?: StrapiMedia | null;
  heroPoster?: StrapiMedia | null;
  presentationVideo?: StrapiMedia | null;
  presentationPoster?: StrapiMedia | null;
}

export type { StrapiNews as News, StrapiPet as Pet, StrapiCampaign as Campaign, StrapiDonation as Donation };

