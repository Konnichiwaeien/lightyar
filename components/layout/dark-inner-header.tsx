"use client";

import Link from "next/link";
import { MenuButton } from "@/components/ui/menu-button";

export function DarkInnerHeader() {
  return (
    <header className="w-full p-6 md:p-8 flex items-center justify-between relative z-50">
      <Link href="/" className="text-2xl font-serif text-[#f5f4f0] hover:text-amber-400 transition-colors">
        Светлый.
      </Link>
      
      <MenuButton variant="dark" />
    </header>
  );
}
