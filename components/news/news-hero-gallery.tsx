"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";

// Restored cutouts from the shelter's photographs; source/edit notes in public/news/README.md.
const photographs = ["handover", "team-together", "community-care", "group-training", "volunteer-walk"];

export function NewsHeroGallery() {
  const region = useRef<HTMLDivElement>(null);
  const ready = useRef(new Set<number>());
  const visible = useInView(region, { amount: .3 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [loadedThrough, setLoadedThrough] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!visible || reduce !== false || paused) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const next = (active + 1) % photographs.length;
      if (!ready.current.has(next)) return;
      setActive(next);
      setLoadedThrough(previous => Math.max(previous, next + 1));
    }, 6000);
    return () => window.clearInterval(timer);
  }, [visible, reduce, active, paused]);

  const current = reduce ? 0 : active;

  return (
    <div ref={region} className="news-gallery">
      <div className="news-gallery__stage" aria-hidden="true">
        <span className="news-hero__circle" />
        <span className="news-hero__dots" />
        {photographs.map((photo, index) => (
          <motion.div key={photo} className="news-gallery__portrait"
            initial={false} animate={{ opacity: index === current ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : .8, ease: [.22, 1, .36, 1] }}>
            {index <= loadedThrough && <Image src={`/news/people-cutouts-v2/${photo}.webp`} alt="" fill
              className="news-gallery__photo"
              quality={90}
              sizes="(max-width: 767px) 90vw, (max-width: 1440px) 48vw, 650px"
              loading="eager"
              fetchPriority={index === 0 ? "high" : "low"}
              onLoad={() => ready.current.add(index)} />}
          </motion.div>
        ))}
      </div>
      <button type="button" className="news-gallery__pause" onClick={() => setPaused(value => !value)}
        aria-label={paused ? "Продолжить смену фотографий" : "Приостановить смену фотографий"}>
        {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}
