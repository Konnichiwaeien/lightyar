import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  sizes?: string;
}

export function BrandLogo({
  className = "",
  sizes = "(min-width: 768px) 64px, 56px",
}: BrandLogoProps) {
  return (
    <Image
      data-brand-logo
      src="/logo.png"
      width={300}
      height={300}
      sizes={sizes}
      alt=""
      draggable={false}
      className={`block size-full object-contain ${className}`}
    />
  );
}
