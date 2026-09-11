"use client";

interface MenuButtonProps {
  variant?: "light" | "dark";
  className?: string;
}

export function MenuButton({ variant = "light", className = "" }: MenuButtonProps) {
  const baseClasses = "group cursor-pointer size-12 md:size-14 rounded-full border bg-[#f7f3eb] text-[#1c1c1c] shadow-[0_8px_24px_rgba(28,28,28,0.14)] flex items-center justify-center transition-[background-color,border-color,box-shadow,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(28,28,28,0.18)] focus-visible:-translate-y-0.5 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-hidden active:translate-y-0 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:transform-none";
  
  const variantClasses = variant === "dark"
    ? "border-white/60 hover:border-white"
    : "border-[#1c1c1c]/15 hover:border-[#1c1c1c]/30";

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-menu"))}
      aria-label="Открыть меню навигации"
      aria-haspopup="dialog"
      data-cursor-glow
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      <span className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[4deg] group-hover:scale-[1.08] group-focus-visible:rotate-[4deg] group-focus-visible:scale-[1.08] motion-reduce:transition-none">
        <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </span>
    </button>
  );
}
