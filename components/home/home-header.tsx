"use client";

import { useCursor } from "@/components/ui/cursor-context";

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export function HomeHeader() {
  const { textEnter, textLeave } = useCursor();

  return (
    <header className="fixed top-0 w-full z-40 p-6 md:p-8 flex justify-end items-center pointer-events-none">
      {/* Round hamburger menu button */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-menu"))}
        onMouseEnter={textEnter}
        onMouseLeave={textLeave}
        aria-label="Открыть меню навигации"
        aria-haspopup="dialog"
        data-cursor-glow
        className={`pointer-events-auto cursor-pointer group size-12 md:size-14 rounded-full border border-[#1c1c1c]/15 bg-[#f7f3eb] text-[#1c1c1c] shadow-[0_8px_24px_rgba(28,28,28,0.14)] flex items-center justify-center transition duration-500 ${EASE} hover:-translate-y-0.5 hover:border-[#1c1c1c]/35 hover:bg-white hover:shadow-[0_14px_32px_rgba(28,28,28,0.2)] focus-visible:-translate-y-0.5 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-hidden active:translate-y-0 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:transform-none`}
      >
        <span className="flex h-4 w-5 flex-col justify-between md:h-[18px] md:w-6" aria-hidden="true">
          <span className={`h-[1.75px] w-full origin-left rounded-full bg-current transition-transform duration-500 ${EASE} group-hover:-translate-y-px group-focus-visible:-translate-y-px motion-reduce:transition-none motion-reduce:transform-none`} />
          <span className={`h-[1.75px] w-full origin-left rounded-full bg-current transition-transform duration-500 ${EASE} group-hover:scale-x-[0.6] group-focus-visible:scale-x-[0.6] motion-reduce:transition-none motion-reduce:transform-none`} />
          <span className={`h-[1.75px] w-full origin-left rounded-full bg-current transition-transform duration-500 ${EASE} group-hover:translate-y-px group-focus-visible:translate-y-px motion-reduce:transition-none motion-reduce:transform-none`} />
        </span>
      </button>
    </header>
  );
}
