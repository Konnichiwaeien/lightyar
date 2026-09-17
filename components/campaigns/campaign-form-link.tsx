"use client";

import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "@/components/ui/smooth-scroll";

/** Open the mounted form without resetting the donor's choices. */
export function CampaignFormLink({ children = "Помочь" }: { children?: string }) {
  const { getLenis } = useLenis();
  const still = useReducedMotion();
  return (
    <motion.a className="camp-btn fund-help-link" href="#fund-contribution"
      whileTap={still ? undefined : { scale: .97 }} onClick={event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById("fund-contribution");
      const tab = target?.querySelector<HTMLButtonElement>('[data-fund-tab="give"]');
      if (!target || !tab) return;
      event.preventDefault();
      tab.click();
      tab.focus({ preventScroll: true });
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { offset: -24, duration: .85, immediate: reduce });
      else target.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
    }}>
      <span className="fund-help__shine" aria-hidden="true" />
      <Heart size={18} aria-hidden="true" /><span>{children}</span>
    </motion.a>
  );
}
