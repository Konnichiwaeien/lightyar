"use client";


/**
 * Мягкие морфящиеся gradient-блобы, создающие эффект «живого света».
 * Они медленно двигаются и растекаются, как лучи солнца через облака.
 */
export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base cream */}
      <div className="absolute inset-0 bg-cream" />

      {/* Large warm blob — top right, slow drift */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 animate-aurora-1"
        style={{
          background: "radial-gradient(circle, rgba(245,194,107,0.5) 0%, transparent 70%)",
          top: "-10%",
          right: "-5%",
          filter: "blur(80px)",
        }}
      />

      {/* Medium amber blob — center left */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-aurora-2"
        style={{
          background: "radial-gradient(circle, rgba(232,145,58,0.4) 0%, transparent 70%)",
          top: "30%",
          left: "-10%",
          filter: "blur(100px)",
        }}
      />

      {/* Small warm blob — bottom center */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-25 animate-aurora-3"
        style={{
          background: "radial-gradient(circle, rgba(245,194,107,0.35) 0%, transparent 70%)",
          bottom: "10%",
          right: "20%",
          filter: "blur(90px)",
        }}
      />

      {/* Very subtle rose accent blob */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 animate-aurora-4"
        style={{
          background: "radial-gradient(circle, rgba(244,114,114,0.3) 0%, transparent 70%)",
          top: "60%",
          left: "30%",
          filter: "blur(120px)",
        }}
      />
    </div>
  );
}
