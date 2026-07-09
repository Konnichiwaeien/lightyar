"use client";

interface MenuButtonProps {
  variant?: "light" | "dark";
  className?: string;
}

export function MenuButton({ variant = "light", className = "" }: MenuButtonProps) {
  const baseClasses = "w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-colors duration-300";
  
  const variantClasses = variant === "dark"
    ? "border-white/20 text-[#f5f4f0] hover:bg-white hover:text-black"
    : "border-[#1c1c1c]/20 text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white";

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-menu"))}
      aria-label="Открыть меню навигации"
      aria-haspopup="dialog"
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
    </button>
  );
}
