"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

export function HeroSection({ textEnter, textLeave }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>("");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.85], [1, 30]);
  const maskOpacity = useTransform(scrollYProgress, [0.55, 0.8], [1, 0]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Generate text mask via canvas on mount
  useEffect(() => {
    const generateMask = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isMobile = window.innerWidth < 768;
      const w = isMobile ? 1080 : 1920;
      const h = isMobile ? 1920 : 1080;
      canvas.width = w;
      canvas.height = h;

      // White background = opaque areas (show beige)
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, w, h);

      // Black text = transparent areas (reveal gradient)
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (isMobile) {
        // Mobile: stack vertically, bigger relative to canvas
        ctx.font = "900 200px Inter, Arial Black, Helvetica Neue, sans-serif";
        ctx.letterSpacing = "-8px";
        ctx.fillText("СВЕТ", w / 2, h / 2 - 180);
        ctx.fillText("ЛЫЙ", w / 2, h / 2 - 0);

        ctx.font = "900 140px Inter, Arial Black, Helvetica Neue, sans-serif";
        ctx.letterSpacing = "-4px";
        ctx.fillText("ЛУЧ", w / 2, h / 2 + 180);
      } else {
        // Desktop: single line
        ctx.font = "900 320px Inter, Arial Black, Helvetica Neue, sans-serif";
        ctx.letterSpacing = "-15px";
        ctx.fillText("СВЕТЛЫЙ", w / 2, h / 2 - 80);

        ctx.font = "900 200px Inter, Arial Black, Helvetica Neue, sans-serif";
        ctx.letterSpacing = "-8px";
        ctx.fillText("ЛУЧ", w / 2, h / 2 + 130);
      }

      const dataUrl = canvas.toDataURL("image/png");
      setMaskUrl(dataUrl);
    };

    generateMask();
    window.addEventListener("resize", generateMask);
    return () => window.removeEventListener("resize", generateMask);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      {/* Hidden canvas for mask generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Layer 1: Gradient "video" */}
        <div className="absolute inset-0 z-0 hero-video-fallback" />

        {/* Video (overlays gradient when available) */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-1"
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Layer 2: Beige overlay with canvas-generated mask */}
        {maskUrl && (
          <motion.div
            className="absolute inset-0 z-2 bg-[#e8e4dc] will-change-transform"
            style={{
              scale,
              opacity: maskOpacity,
              transformOrigin: "50% 45%",
              WebkitMaskImage: `url(${maskUrl})`,
              WebkitMaskSize: "cover",
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskImage: `url(${maskUrl})`,
              maskSize: "cover",
              maskPosition: "center",
              maskRepeat: "no-repeat",
            }}
          />
        )}

        {/* Layer 3: Bottom info bar */}
        <motion.div
          style={{ opacity: subtitleOpacity }}
          className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1c1c1c]/40 mb-3">
              Приют «Светлый» · Ярославль
            </p>
            <p className="text-lg md:text-xl font-light max-w-md font-serif italic text-[#1c1c1c]">
              Мы проливаем свет на тех, кто&nbsp;в&nbsp;тени
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#donate"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              className="bg-[#1c1c1c] text-[#e8e4dc] px-7 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-colors duration-300 pointer-events-auto cursor-none"
            >
              Помочь сейчас
            </a>
            <a
              href="#pets"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              className="border border-[#1c1c1c]/20 text-[#1c1c1c] px-7 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:border-[#1c1c1c]/60 transition-colors duration-300 pointer-events-auto cursor-none"
            >
              Найти друга
            </a>
          </div>
        </motion.div>

        {/* Layer 4: Scroll indicator */}
        <motion.div
          style={{ opacity: subtitleOpacity }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[8px] uppercase tracking-[0.3em] text-[#1c1c1c]/30">Scroll</span>
          <div className="w-px h-8 bg-[#1c1c1c]/20 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full bg-amber-500"
              animate={{ height: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
