'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/** Keep the CMS rendition available if the image optimizer is temporarily unavailable. */
export function ProfilePhoto({ src, fallbackSrc, alt, sizes, preload = false, className }: { src: string; fallbackSrc?: string; alt: string; sizes: string; preload?: boolean; className?: string }) {
  const [failure, setFailure] = useState(0);
  if (failure > 1) return <div className="pet-gallery__empty"><ImageOff size={28} aria-hidden="true" /><span>Фото пока недоступно</span></div>;
  return <Image src={failure ? fallbackSrc || src : src} alt={alt} fill sizes={sizes} preload={preload} unoptimized={failure === 1} className={className} onError={() => setFailure(value => value + 1)} />;
}
