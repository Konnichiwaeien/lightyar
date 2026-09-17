"use client";

import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

type ResilientImageProps = Omit<ImageProps, "onError"> & {
  fallbackLabel?: string;
};

export function ResilientImage({ fallbackLabel = "Фото временно недоступно", src, alt, ...props }: ResilientImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const [directSrc, setDirectSrc] = useState<ImageProps["src"] | null>(null);
  const failed = failedSrc === src;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${alt}. ${fallbackLabel}`}
        className="absolute inset-0 grid place-content-center gap-2 bg-[#f4ece1] p-5 text-center text-[#8a5b22]"
      >
        <ImageOff className="mx-auto" size={28} aria-hidden="true" />
        <span className="text-xs font-semibold">{fallbackLabel}</span>
      </div>
    );
  }

  return <Image {...props} unoptimized={props.unoptimized || directSrc === src} src={src} alt={alt} onError={() => {
    // A failed optimisation request does not imply that the source is missing.
    if (!props.unoptimized && directSrc !== src) setDirectSrc(src);
    else setFailedSrc(src);
  }} />;
}
