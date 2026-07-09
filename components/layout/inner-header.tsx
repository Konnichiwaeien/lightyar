"use client";

import Link from "next/link";
import { PawLogo } from "@/components/ui/paw-logo";
import { MenuButton } from "@/components/ui/menu-button";

export function InnerHeader() {
  return (
    <header className="w-full p-6 md:p-8 flex items-center justify-between">
      {/* Paw logo — unified with home header and menu */}
      <Link
        href="/"
        aria-label="Главная страница приюта Светлый"
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#1c1c1c]/20 flex items-center justify-center hover:border-[#d97706] transition-colors duration-300 text-[#1c1c1c]"
      >
        <PawLogo className="w-5 h-5 md:w-6 md:h-6" />
      </Link>
      
      <MenuButton variant="light" />
    </header>
  );
}
