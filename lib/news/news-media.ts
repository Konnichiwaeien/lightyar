import type {
  StrapiMedia,
  StrapiNewsAttachment,
} from "../api/types.ts";

type ResolveMediaUrl = (url: string) => string;

interface NewsMediaSource {
  title: string;
  mainImage?: StrapiMedia | null;
  gallery?: StrapiMedia[] | null;
  attachments?: StrapiNewsAttachment[] | null;
}

export interface NewsImageSlide {
  key: string;
  kind: "image";
  src: string;
  alt: string;
}

export interface NewsVideoSlide {
  key: string;
  kind: "video";
  title: string;
  src?: string;
  mime?: string;
  poster?: string;
  captionsSrc?: string;
  externalUrl?: string;
  duration?: number;
  provider: StrapiNewsAttachment["provider"];
}

export type NewsSlide = NewsImageSlide | NewsVideoSlide;

export interface NewsSupplementaryAttachment {
  key: string;
  kind: "audio" | "file";
  provider: StrapiNewsAttachment["provider"];
  title: string;
  description?: string;
  transcript?: string;
  src?: string;
  mime?: string;
  externalUrl?: string;
}

function hasMimePrefix(media: StrapiMedia | null | undefined, prefix: string) {
  return !media?.mime || media.mime.startsWith(prefix);
}

function resolveOptionalMedia(
  media: StrapiMedia | null | undefined,
  resolveMediaUrl: ResolveMediaUrl,
) {
  return media?.url ? resolveMediaUrl(media.url) : undefined;
}

function attachmentOrder(
  left: StrapiNewsAttachment,
  right: StrapiNewsAttachment,
) {
  return (left.order ?? 0) - (right.order ?? 0);
}

function playableAttachmentSource(
  attachment: StrapiNewsAttachment,
  resolveMediaUrl: ResolveMediaUrl,
  mimePrefix: "video/" | "audio/",
) {
  if (attachment.media?.url && hasMimePrefix(attachment.media, mimePrefix)) {
    return resolveMediaUrl(attachment.media.url);
  }

  if (attachment.provider === "direct" && attachment.externalUrl) {
    return attachment.externalUrl;
  }

  return undefined;
}

export function buildNewsSlides(
  article: NewsMediaSource,
  resolveMediaUrl: ResolveMediaUrl,
): NewsSlide[] {
  const slides: NewsSlide[] = [];
  const imageUrls = new Set<string>();
  const images = [article.mainImage, ...(article.gallery ?? [])];

  images.forEach((media, index) => {
    if (!media?.url || !hasMimePrefix(media, "image/")) return;

    const src = resolveMediaUrl(media.url);
    if (!src || imageUrls.has(src)) return;

    imageUrls.add(src);
    slides.push({
      key: `image:${media.documentId || media.id || src}`,
      kind: "image",
      src,
      alt: media.alternativeText?.trim() || `${article.title} — фото ${index + 1}`,
    });
  });

  [...(article.attachments ?? [])]
    .filter((attachment) => attachment.kind === "video")
    .sort(attachmentOrder)
    .forEach((attachment, index) => {
      const src = playableAttachmentSource(
        attachment,
        resolveMediaUrl,
        "video/",
      );
      const externalUrl = attachment.externalUrl || undefined;

      if (!src && !externalUrl) return;

      slides.push({
        key: `video:${attachment.id ?? index}:${src ?? externalUrl}`,
        kind: "video",
        title: attachment.title,
        src,
        mime: attachment.media?.mime || undefined,
        poster: hasMimePrefix(attachment.poster, "image/")
          ? resolveOptionalMedia(attachment.poster, resolveMediaUrl)
          : undefined,
        captionsSrc: resolveOptionalMedia(
          attachment.captions,
          resolveMediaUrl,
        ),
        externalUrl,
        duration: attachment.duration ?? undefined,
        provider: attachment.provider,
      });
    });

  return slides;
}

export function getSupplementaryNewsAttachments(
  attachments: StrapiNewsAttachment[] | null | undefined,
  resolveMediaUrl: ResolveMediaUrl,
): NewsSupplementaryAttachment[] {
  return [...(attachments ?? [])]
    .filter(
      (attachment): attachment is StrapiNewsAttachment & {
        kind: "audio" | "file";
      } => attachment.kind === "audio" || attachment.kind === "file",
    )
    .sort(attachmentOrder)
    .flatMap((attachment, index) => {
      const src =
        attachment.kind === "audio"
          ? playableAttachmentSource(attachment, resolveMediaUrl, "audio/")
          : resolveOptionalMedia(attachment.media, resolveMediaUrl);
      const externalUrl = attachment.externalUrl || undefined;

      if (!src && !externalUrl) return [];

      return [{
        key: `${attachment.kind}:${attachment.id ?? index}:${src ?? externalUrl}`,
        kind: attachment.kind,
        provider: attachment.provider,
        title: attachment.title,
        description: attachment.description || undefined,
        transcript: attachment.transcript || undefined,
        src,
        mime: attachment.media?.mime || undefined,
        externalUrl,
      }];
    });
}
