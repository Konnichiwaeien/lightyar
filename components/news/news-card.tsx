"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { useCursor } from "@/components/ui/cursor-context";
import { StrapiNews } from "@/lib/api/types";
import { strapiClient } from "@/lib/api/client";

interface NewsCardProps {
  article: StrapiNews;
  isLarge?: boolean;
  isReversed?: boolean;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function NewsCard({ article, isLarge = false }: NewsCardProps) {
  const { textEnter, textLeave } = useCursor();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const shouldReduceMotion = useReducedMotion() && mounted;
  
  const imageUrl = article.mainImage?.url 
    ? strapiClient.resolveMediaUrl(article.mainImage.url)
    : "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"; // fallback

  const excerpt = article.excerpt || article.content;

  return (
    <motion.li
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
      className={`h-full list-none ${isLarge ? "md:col-span-2" : "col-span-1"}`}
    >
      <Link
        href={`/news/${article.slug}`}
        className={`group h-full bg-white rounded-[2rem] overflow-hidden border border-[#1c1c1c]/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 flex flex-col pointer-events-auto cursor-none focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden ${
          isLarge ? "md:flex-row" : ""
        }`}
        onMouseEnter={textEnter}
        onMouseLeave={textLeave}
      >
        {/* Card Image Wrapper: No margins, touches the borders, but has symmetric rounding-[2rem] on all sides */}
        <div className={`relative shrink-0 overflow-hidden rounded-[2rem] ${
          isLarge 
            ? "w-full h-64 sm:h-80 md:h-auto md:w-[45%] min-h-[320px]" 
            : "w-full h-72 sm:h-80"
        }`}>
          <Image 
            src={imageUrl} 
            alt={article.title}
            fill
            sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"}
            className="object-cover group-hover:scale-103 transition-transform duration-1000 ease-out"
            priority={isLarge}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
          
          {/* Tags list (Supports multiple tags) */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex flex-wrap gap-1.5 max-w-[calc(100%-24px)] z-20">
            {article.tags && article.tags.length > 0 ? (
              article.tags.slice(0, 3).map((tag) => (
                <div 
                  key={tag.id} 
                  className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#1c1c1c] flex items-center gap-1.5 shadow-sm"
                >
                  <Tag size={9} className="text-amber-500 shrink-0" aria-hidden="true" />
                  <span>{tag.name}</span>
                </div>
              ))
            ) : (
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#1c1c1c] flex items-center gap-1.5 shadow-sm">
                <Tag size={9} className="text-amber-500 shrink-0" aria-hidden="true" />
                <span>Новость</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className={`p-6 sm:p-8 flex flex-col flex-1 bg-white relative z-10 justify-between gap-6 ${
          isLarge ? "sm:p-10 md:p-12 md:w-[55%]" : ""
        }`}>
          <div className="space-y-3 sm:space-y-4">
            {/* Date line */}
            <div className="flex items-center gap-1.5 text-xs text-[#1c1c1c]/40 font-medium font-sans">
              <Calendar size={12} className="shrink-0" aria-hidden="true" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>

            {/* Title */}
            <h3 className={`font-serif leading-tight group-hover:text-amber-600 transition-colors duration-300 text-[#1c1c1c] text-wrap: balance ${
              isLarge 
                ? "text-2xl sm:text-3xl md:text-4xl" 
                : "text-xl sm:text-2xl"
            }`}>
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className={`text-[#1c1c1c]/55 font-light leading-relaxed font-sans ${
              isLarge 
                ? "text-base sm:text-lg line-clamp-4" 
                : "text-sm line-clamp-3"
            }`}>
              {excerpt}
            </p>
          </div>

          {/* Action indicator in Brand Amber Color */}
          <div className="pt-4 border-t border-[#1c1c1c]/5 flex items-center justify-between mt-auto">
            <span className={`inline-flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-all duration-300 ${
              isLarge
                ? "bg-amber-500 text-white hover:bg-amber-600 px-6 py-3 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.15)] group-hover:bg-amber-600 hover:scale-102 active:scale-98"
                : "text-amber-500 group-hover:text-amber-600"
            }`}>
              <span>Читать полностью</span>
              <ArrowRight size={isLarge ? 14 : 12} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
