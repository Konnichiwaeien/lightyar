"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { campaignFallbackCover } from "@/lib/campaigns/fallback-cover";

export function CampaignImage({ title, src, alt, ...props }: ImageProps & { title: string }) {
  const [failures, setFailures] = useState<string[]>([]);
  const fallback = campaignFallbackCover(title);
  const candidates = [src, fallback].filter((value): value is string => typeof value === "string" && Boolean(value) && value !== "/photo-placeholder.jpg");
  const current = candidates.find(value => !failures.includes(value)) ?? fallback;
  return <Image {...props} src={current} alt={current === fallback ? `Иллюстрация к сбору: ${title}` : alt}
    onError={() => setFailures(previous => previous.includes(current) ? previous : [...previous, current])} />;
}
