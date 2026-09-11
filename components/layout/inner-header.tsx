"use client";

import { MenuButton } from "@/components/ui/menu-button";

export function InnerHeader() {
  return (
    <header className="w-full p-6 md:p-8 flex items-center justify-end">
      <MenuButton variant="light" />
    </header>
  );
}
