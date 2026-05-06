"use client";

import { useState, useEffect } from "react";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
  imageEnter: () => void;
  imageLeave: () => void;
}

interface Particle {
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
  driftY: number;
  blur: number;
  zIndex: number;
}

// Light particle dust motes — beautiful cinematic style with depth of field
function LightParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => {
        // Create depth of field effect: 3 layers
        const layer = i % 3; // 0: background (blurry), 1: midground (sharp), 2: foreground (very blurry)
        
        let size, blur, opacity, zIndex;
        if (layer === 0) {
          // Background (blurry, small)
          size = 2 + Math.random() * 3;
          blur = 2 + Math.random() * 2;
          opacity = 0.4 + Math.random() * 0.4; // Slightly increased for visibility
          zIndex = 0;
        } else if (layer === 1) {
          // Midground (sharp, tiny)
          size = 1 + Math.random() * 1.5;
          blur = 0.5 + Math.random() * 1;
          opacity = 0.6 + Math.random() * 0.4;
          zIndex = 10;
        } else {
          // Foreground (very blurry, large)
          size = 4 + Math.random() * 6;
          blur = 3 + Math.random() * 4;
          opacity = 0.2 + Math.random() * 0.3;
          zIndex = 20;
        }

        return {
          size,
          left: Math.random() * 100,
          top: Math.random() * 100,
          duration: 15 + Math.random() * 20, // Much slower, organic drift
          delay: -(Math.random() * 20), // Negative delay so they are already moving on mount
          opacity,
          driftX: -20 + Math.random() * 40,
          driftY: -30 + Math.random() * -40, // Mostly drift upwards
          blur: blur,
          zIndex: zIndex
        };
      })
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes cinematicFloat {
          0% { 
            transform: translate(0, 0); 
            opacity: 0;
          }
          15% {
            opacity: var(--base-opacity);
          }
          50% { 
            transform: translate(calc(var(--drift-x) * 0.5), calc(var(--drift-y) * 0.5)); 
            opacity: calc(var(--base-opacity) * 1.5);
          }
          85% {
            opacity: var(--base-opacity);
          }
          100% {
            transform: translate(var(--drift-x), var(--drift-y));
            opacity: 0;
          }
        }
      `}</style>
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none mix-blend-normal"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: "#ffffff",
              boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(255, 200, 100, 0.8)`,
              filter: `blur(${p.blur}px)`,
              opacity: 0, // Starts at 0, animation handles opacity
              zIndex: p.zIndex,
              animation: `cinematicFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
              // @ts-expect-error CSS custom properties
              "--drift-x": `${p.driftX}vw`,
              "--drift-y": `${p.driftY}vh`,
              "--base-opacity": p.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
}

export function AboutSection({ textEnter, textLeave, imageEnter, imageLeave }: Props) {
  return (
    <section className="relative py-24 md:py-32 w-full overflow-hidden" id="about">
      <LightParticles />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">
        
        {/* Label */}
        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-10 text-[#F5A623]">
          [ О нас ]
        </h2>

        {/* Massive Centered Editorial Title */}
        <p
          className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.05] text-center tracking-tight mb-12 max-w-5xl text-stone-800"
          onMouseEnter={textEnter}
          onMouseLeave={textLeave}
        >
          Небольшая команда, большое <span className="italic font-light text-[#F5A623]">дело</span>
        </p>

        {/* Subtitle / Description */}
        <p className="text-lg md:text-2xl font-light opacity-60 text-center max-w-4xl leading-relaxed mb-16 md:mb-24">
          Мы — волонтёры из Ярославля с многолетним стажем. В октябре 2024 объединились в фонд, чтобы помогать системно. Сейчас на попечении 85 хвостиков — и каждому мы ищем свою семью.
        </p>

        {/* Cinematic Integrated Block */}
        <div className="w-full relative flex flex-col items-center">
          
          {/* Overlapping Floating Stats */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 px-4 md:px-12 mb-8 md:-mb-12 relative z-20 text-center">
            
            <div className="bg-[#FDFBF7]/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-4 rounded-3xl">
              <div className="text-5xl md:text-6xl lg:text-[5.5rem] font-serif mb-2 text-stone-800">
                60<span className="text-[#F5A623] font-light">+</span>
              </div>
              <div className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] opacity-50">
                Собак на кураторстве
              </div>
            </div>

            <div className="bg-[#FDFBF7]/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-4 rounded-3xl">
              <div className="text-5xl md:text-6xl lg:text-[5.5rem] font-serif mb-2 text-stone-800">
                25
              </div>
              <div className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] opacity-50">
                Кошек в безопасности
              </div>
            </div>

            <div className="bg-[#FDFBF7]/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-4 rounded-3xl">
              <div className="text-5xl md:text-6xl lg:text-[5.5rem] font-serif mb-2 text-[#F5A623]">
                100<span className="text-stone-800 font-light">+</span>
              </div>
              <div className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623]">
                Спасенных жизней
              </div>
            </div>

          </div>

          {/* Panoramic Image Container */}
          <div 
            className="w-full aspect-video md:aspect-21/9 rounded-4xl md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-stone-200/50 to-[#F5A623]/20 relative shadow-2xl shadow-[#F5A623]/10 z-10"
            onMouseEnter={imageEnter}
            onMouseLeave={imageLeave}
          >
            <span className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs md:text-sm font-light uppercase tracking-[0.3em] opacity-50">
              [ Фото приюта / Панорама ]
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
