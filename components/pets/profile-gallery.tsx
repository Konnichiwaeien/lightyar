'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import { ArrowLeft, ArrowRight, Expand, ImageOff, X } from 'lucide-react';
import { ProfilePhoto } from './profile-photo';
import { useLenis } from '@/components/ui/smooth-scroll';
import 'swiper/css';
import 'swiper/css/a11y';

const modules = [A11y];
export function ProfileGallery({ images, name }: { images: { src: string; thumbnail: string; preview: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failedThumbs, setFailedThumbs] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const main = useRef<SwiperInstance | null>(null);
  const full = useRef<SwiperInstance | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const still = usePrefersReducedMotion();
  const { getLenis } = useLenis();
  const missing = !images.length;
  const speed = still ? 0 : 340;

  useEffect(() => {
    if (!mounted) return;
    dialog.current?.showModal();
    getLenis()?.stop();
    return () => { getLenis()?.start(); };
  }, [mounted, getLenis]);

  function close() { setOpen(false); }
  function finishClose() {
    if (open) return;
    dialog.current?.close();
    setMounted(false);
    opener.current?.focus({ preventScroll: true });
  }
  function select(index: number) {
    const next = (index + images.length) % images.length;
    main.current?.slideTo(next, speed);
    full.current?.slideTo(next, speed);
    setActive(next);
  }
  function changed(swiper: SwiperInstance, modal: boolean) {
    const next = swiper.activeIndex;
    setActive(next);
    if (modal) main.current?.slideTo(next, 0);
    const thumb = thumbs.current?.children[next] as HTMLElement | undefined;
    if (thumb && thumbs.current) thumbs.current.scrollTo({ left: thumb.offsetLeft - thumbs.current.offsetLeft - thumbs.current.clientWidth / 2 + thumb.clientWidth / 2, behavior: still ? 'instant' : 'smooth' });
  }
  function slides(modal: boolean) {
    return <Swiper className={modal ? 'pet-gallery__full-swiper' : 'pet-gallery__swiper'} modules={modules} slidesPerView={1} speed={speed} rewind watchOverflow touchAngle={35}
      initialSlide={modal ? active : 0} onSwiper={swiper => { if (modal) full.current = swiper; else { main.current = swiper; setReady(true); } }}
      onSlideChange={swiper => changed(swiper, modal)} a11y={{ containerMessage: `Фотографии: ${name}`, slideLabelMessage: 'Фото {{index}} из {{slidesLength}}' }}>
      {images.map((photo, index) => <SwiperSlide key={`${photo.src}-${index}`}>{({ isActive, isPrev, isNext }) =>
        index === (modal ? active : 0) || isActive || isPrev || isNext ? <ProfilePhoto src={photo.src} fallbackSrc={photo.preview} alt={`${name}. Фото ${index + 1}`} sizes={modal ? '95vw' : '(max-width: 1100px) 90vw, 660px'} preload={!modal && index === 0} className={modal ? 'pet-gallery__full-image' : index === active ? 'pet-gallery__image' : 'pet-gallery__slide-image'} /> : null
      }</SwiperSlide>)}
    </Swiper>;
  }
  function controls() { return <><motion.button type="button" whileTap={still ? undefined : { scale: .92 }} className="pet-profile__icon-button" aria-label="Предыдущее фото" onClick={() => select(active - 1)}><ArrowLeft size={20} aria-hidden="true" /></motion.button><span aria-live="polite" aria-atomic="true">{active + 1} / {images.length}</span><motion.button type="button" whileTap={still ? undefined : { scale: .92 }} className="pet-profile__icon-button" aria-label="Следующее фото" onClick={() => select(active + 1)}><ArrowRight size={20} aria-hidden="true" /></motion.button></>; }
  return <div className="pet-gallery" role="region" aria-label={`Фотографии: ${name}`} onKeyDown={event => {
    if (images.length < 2 || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); select(active + (event.key === 'ArrowRight' ? 1 : -1)); }
  }}>
    <div className="pet-gallery__stage">
      {missing ? <div className="pet-gallery__empty"><ImageOff size={32} aria-hidden="true" /><span>Фото пока недоступно</span></div> : slides(false)}
      {!missing && <motion.button ref={opener} type="button" disabled={!ready} whileTap={still ? undefined : { scale: .94 }} className="pet-profile__icon-button pet-gallery__expand" aria-label="Открыть фото целиком" onClick={() => { setMounted(true); setOpen(true); }}><Expand size={19} aria-hidden="true" /></motion.button>}
      {images.length > 1 && <div className="pet-gallery__controls">{controls()}</div>}
    </div>
    {images.length > 1 && <div ref={thumbs} className="pet-gallery__thumbs" aria-label="Выбрать фотографию">{images.map(({ src, thumbnail }, index) => <button key={`${src}-${index}`} type="button" aria-label={`Фото ${index + 1}`} aria-pressed={active === index} onClick={() => select(index)}>{failedThumbs.includes(src) ? <span>{index + 1}</span> : <Image src={thumbnail} alt="" fill sizes="72px" unoptimized onError={() => setFailedThumbs(values => [...values, src])} />}</button>)}</div>}
    <dialog ref={dialog} className="pet-gallery__dialog" aria-label={`Фотография: ${name}`} data-lenis-prevent onCancel={event => { event.preventDefault(); close(); }} onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      {mounted && <>
        <motion.div className="pet-gallery__backdrop" aria-hidden="true" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: still ? 0 : open ? .28 : .18 }} />
        <motion.div className="pet-gallery__viewer" initial={{ opacity: 0, scale: still ? 1 : .97, y: still ? 0 : 12 }} animate={{ opacity: open ? 1 : 0, scale: open || still ? 1 : .98, y: open || still ? 0 : 8 }} transition={{ duration: still ? 0 : open ? .3 : .18, ease: [.22, 1, .36, 1] }} onAnimationComplete={finishClose}>
          <button type="button" autoFocus className="pet-profile__icon-button pet-gallery__close" aria-label="Закрыть фото" onClick={close}><X size={22} aria-hidden="true" /></button>
          <div className="pet-gallery__full">{slides(true)}</div>
          {images.length > 1 && <div className="pet-gallery__controls">{controls()}</div>}
        </motion.div>
      </>}
    </dialog>
  </div>;
}
