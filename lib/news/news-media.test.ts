import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNewsSlides,
  getSupplementaryNewsAttachments,
} from "./news-media.ts";
import type { StrapiMedia, StrapiNewsAttachment } from "../api/types.ts";

function media(
  id: number,
  url: string,
  mime: string,
  alternativeText: string | null = null,
): StrapiMedia {
  return {
    id,
    documentId: `media-${id}`,
    name: url.split("/").at(-1) || `media-${id}`,
    alternativeText,
    caption: null,
    width: 1600,
    height: 900,
    mime,
    url,
  };
}

const resolveMediaUrl = (url: string) => `https://cms.example.test${url}`;

test("video covers are not repeated as a static image before the video", () => {
  const poster = media(55, "/uploads/clip-poster.jpg", "image/jpeg");
  const slides = buildNewsSlides({title:"Клип",mainImage:poster,attachments:[{
    kind:"video",provider:"vk",title:"Клип",poster,externalUrl:"https://vk.com/video-12_88",
  }]},resolveMediaUrl);
  assert.deepEqual(slides.map(slide=>slide.kind),["video"]);
  assert.equal(slides[0].kind === "video" && slides[0].poster,"https://cms.example.test/uploads/clip-poster.jpg");
  const broken = buildNewsSlides({title:"Клип",mainImage:poster,attachments:[{kind:"video",provider:"vk",title:"Клип",poster}]},resolveMediaUrl);
  assert.deepEqual(broken.map(slide=>slide.kind),["image"]);
});

test("buildNewsSlides keeps legacy images and never sends video media to Image", () => {
  const slides = buildNewsSlides(
    {
      title: "История Рыжика",
      mainImage: media(1, "/uploads/cover.jpg", "image/jpeg", "Рыжик дома"),
      gallery: [
        media(2, "/uploads/second.webp", "image/webp"),
        media(3, "/uploads/legacy-video.mp4", "video/mp4"),
      ],
      attachments: [],
    },
    resolveMediaUrl,
  );

  assert.deepEqual(slides.map((slide) => slide.kind), ["image", "image"]);
  assert.equal(slides[0].kind, "image");
  if (slides[0].kind !== "image") assert.fail("expected an image slide");
  assert.equal(slides[0].alt, "Рыжик дома");
  assert.equal(slides[1].src, "https://cms.example.test/uploads/second.webp");
});

test("buildNewsSlides maps uploaded and direct videos to playable slides", () => {
  const attachments: StrapiNewsAttachment[] = [
    {
      id: 5,
      kind: "video",
      provider: "upload",
      title: "Рыжик играет",
      media: media(5, "/uploads/ryzhik.mp4", "video/mp4"),
      poster: media(6, "/uploads/ryzhik-poster.jpg", "image/jpeg"),
      captions: media(7, "/uploads/ryzhik.vtt", "text/vtt"),
      order: 2,
    },
    {
      id: 8,
      kind: "video",
      provider: "direct",
      title: "Прямое видео",
      externalUrl: "https://media.example.test/video.webm",
      order: 1,
    },
  ];

  const slides = buildNewsSlides(
    {
      title: "История Рыжика",
      mainImage: media(1, "/uploads/cover.jpg", "image/jpeg"),
      gallery: [],
      attachments,
    },
    resolveMediaUrl,
  );

  assert.equal(slides[1].kind, "video");
  assert.equal(slides[1].src, "https://media.example.test/video.webm");
  assert.equal(slides[2].kind, "video");
  assert.equal(slides[2].src, "https://cms.example.test/uploads/ryzhik.mp4");
  assert.equal(slides[2].poster, "https://cms.example.test/uploads/ryzhik-poster.jpg");
  assert.equal(slides[2].captionsSrc, "https://cms.example.test/uploads/ryzhik.vtt");
});

test("VK videos become poster links while audio and files stay out of the slider", () => {
  const attachments: StrapiNewsAttachment[] = [
    {
      id: 9,
      kind: "video",
      provider: "vk",
      title: "Видео из ВКонтакте",
      externalUrl: "https://vk.com/video-1_2",
      poster: media(9, "/uploads/vk-poster.jpg", "image/jpeg"),
      order: 3,
    },
    {
      id: 10,
      kind: "audio",
      provider: "upload",
      title: "Аудиозапись",
      media: media(10, "/uploads/story.mp3", "audio/mpeg"),
      order: 2,
    },
    {
      id: 11,
      kind: "file",
      provider: "vk",
      title: "Документ",
      externalUrl: "https://vk.com/doc-1_2",
      order: 1,
    },
  ];

  const slides = buildNewsSlides(
    {
      title: "История Рыжика",
      mainImage: media(1, "/uploads/cover.jpg", "image/jpeg"),
      gallery: [],
      attachments,
    },
    resolveMediaUrl,
  );
  const supplementary = getSupplementaryNewsAttachments(
    attachments,
    resolveMediaUrl,
  );

  assert.deepEqual(slides.map((slide) => slide.kind), ["image", "video"]);
  assert.equal(slides[1].kind, "video");
  if (slides[1].kind !== "video") assert.fail("expected a video slide");
  assert.equal(slides[1].src, undefined);
  assert.equal(slides[1].externalUrl, "https://vk.com/video-1_2");
  assert.deepEqual(supplementary.map((item) => item.kind), ["file", "audio"]);
  assert.equal(supplementary[1].src, "https://cms.example.test/uploads/story.mp3");
});
