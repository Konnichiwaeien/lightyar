"use client";

import { MenuButton } from "@/components/ui/menu-button";

export function DarkInnerHeader() {
  return (
    <header className="w-full p-6 md:p-8 flex items-center justify-end relative z-50">
      <MenuButton variant="dark" />
    </header>
  );
}
