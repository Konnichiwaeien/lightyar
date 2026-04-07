"use client";

/**
 * Анимированные световые лучи — наклонные полосы света,
 * которые медленно скользят через всю страницу,
 * как солнечный свет через занавески.
 */
export function LightRays() {
  return (
    <div className="fixed inset-0 -z-[5] overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Ray 1 — wide, slow sweep */}
      <div
        className="absolute w-[200px] h-[200%] opacity-[0.04] animate-ray-sweep-1"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(245,194,107,1) 50%, transparent 100%)",
          transform: "rotate(25deg)",
          top: "-50%",
          left: "-10%",
          filter: "blur(30px)",
        }}
      />

      {/* Ray 2 — thinner, different angle/speed */}
      <div
        className="absolute w-[120px] h-[200%] opacity-[0.03] animate-ray-sweep-2"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(232,145,58,0.8) 50%, transparent 100%)",
          transform: "rotate(20deg)",
          top: "-50%",
          left: "20%",
          filter: "blur(20px)",
        }}
      />

      {/* Ray 3 — subtle and wide */}
      <div
        className="absolute w-[300px] h-[200%] opacity-[0.025] animate-ray-sweep-3"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(245,194,107,0.6) 50%, transparent 100%)",
          transform: "rotate(30deg)",
          top: "-50%",
          right: "10%",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
