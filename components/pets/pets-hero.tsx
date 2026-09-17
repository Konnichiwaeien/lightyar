import Image, { getImageProps } from 'next/image';
import { ArrowDown, PawPrint } from 'lucide-react';

export function PetsHero() {
  const common = { alt: '', quality: 90, sizes: '(min-width: 1800px) 1800px, 100vw' };
  const desktop = getImageProps({ ...common, src: '/pets/hero-home-desktop.webp', width: 1536, height: 1024 }).props;
  const tablet = getImageProps({ ...common, sizes: '(min-width: 1000px) 1000px, 100vw', src: '/pets/hero-home-tablet-hd.webp', width: 1254, height: 1254 }).props;
  const mobile = getImageProps({ ...common, src: '/pets/hero-home-mobile-hd.webp', width: 1024, height: 1536 }).props;
  return (
    <section className="pets-cover" aria-labelledby="pets-hero-title">
      <div className="pets-cover__inner">
        <picture className="pets-cover__scene">
          <source media="(max-width: 599px)" srcSet={mobile.srcSet} sizes={mobile.sizes} width={1024} height={1536} />
          <source media="(max-width: 1199px)" srcSet={tablet.srcSet} sizes={tablet.sizes} width={1254} height={1254} />
          {/* Art direction: each source has its own composition and intrinsic ratio. */}
          <img {...desktop} alt="" loading="eager" />
        </picture>
        <div className="pets-cover__copy">
          <h1 id="pets-hero-title">Давайте <span>знакомиться</span></h1>
          <p className="pets-cover__intro"><strong>Они ждут <em>своих людей.</em></strong><span>Собаки и кошки приюта «Светлый» в Ярославле <mark>ищут дом.</mark></span></p>
          <a href="#pets-catalog" className="pets-button pets-button--light"><PawPrint size={19} aria-hidden="true" />Смотреть питомцев <ArrowDown size={17} aria-hidden="true" /></a>
        </div>
        <div className="pets-cover__collage" aria-hidden="true">
          <Image className="pets-cover__animal pets-cover__animal--dzhek" src="/pets/cutout-dzhek-hd.webp" alt="" width={1200} height={1200} quality={90} sizes="(max-width: 599px) 49vw, (max-width: 1199px) 32vw, (min-width: 1800px) 468px, 26vw" loading="eager" />
          <Image className="pets-cover__animal pets-cover__animal--silviya" src="/pets/cutout-silviya-hd.webp" alt="" width={1200} height={1200} quality={90} sizes="(max-width: 599px) 1px, (max-width: 1199px) 24vw, (min-width: 1800px) 306px, 17vw" loading="lazy" />
          <Image className="pets-cover__animal pets-cover__animal--tessi" src="/pets/cutout-tessi-hd.webp" alt="" width={1200} height={1200} quality={90} sizes="(max-width: 599px) 29vw, (max-width: 1199px) 22vw, (min-width: 1800px) 306px, 17vw" loading="eager" />
          <Image className="pets-cover__animal pets-cover__animal--kapral" src="/pets/cutout-kapral-hd.webp" alt="" width={1200} height={1200} quality={90} sizes="(max-width: 1199px) 1px, (min-width: 1800px) 288px, 16vw" loading="lazy" />
          <Image className="pets-cover__animal pets-cover__animal--tisha" src="/pets/cutout-tisha.webp" alt="" width={1800} height={1800} quality={90} sizes="(max-width: 599px) 39vw, (max-width: 1199px) 30vw, (min-width: 1800px) 414px, 23vw" preload />
        </div>
      </div>
    </section>
  );
}
