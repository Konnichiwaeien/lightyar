"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/ui/smooth-scroll";

/** Refresh scroll geometry after server boundaries replace their placeholders. */
export function HomeStreamRefresh() {
  const { getLenis } = useLenis();
  useEffect(() => {
    const root = document.getElementById("main-content");
    if (!root || !root.querySelector("[data-home-pending]")) return;
    let frame = 0;
    let anchor = window.location.hash;
    const cancelAnchor = () => { anchor = ""; };
    const rememberAnchor = () => { anchor = window.location.hash; };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) cancelAnchor();
    };
    let pending = root.querySelectorAll("[data-home-pending]").length;
    const observer = new MutationObserver(() => {
      const remaining = root.querySelectorAll("[data-home-pending]").length;
      if (remaining === pending) return;
      pending = remaining;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        getLenis()?.resize();
        window.dispatchEvent(new Event("resize"));
        // Only finish an anchor jump the user has not interrupted by scrolling.
        // Do not move the viewport on ordinary arrival at the top of the page.
        if (remaining === 0 && anchor && anchor === window.location.hash) {
          let id: string;
          try { id = decodeURIComponent(anchor.slice(1)); } catch { return; }
          const target = document.getElementById(id);
          if (target) {
            getLenis()?.scrollTo(target, { immediate: true, force: true });
            target.scrollIntoView({ behavior: "instant" });
          }
        }
      });
      if (remaining === 0) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener("wheel", cancelAnchor, { passive: true });
    window.addEventListener("touchstart", cancelAnchor, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", rememberAnchor);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", cancelAnchor);
      window.removeEventListener("touchstart", cancelAnchor);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", rememberAnchor);
    };
  }, [getLenis]);
  return null;
}
