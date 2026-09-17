"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type WheelEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface FundTab { key: string; label: string; icon?: ReactNode; panel: ReactNode }

/** Let the browser scroll this panel only while it has room in that direction.
 * Otherwise the event reaches the page's smooth-scroll handler. */
export function handlePanelWheel(event: WheelEvent<HTMLDivElement>) {
  if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
  const panel = event.currentTarget;
  const maxScroll = panel.scrollHeight - panel.clientHeight;
  if (maxScroll <= 1) return;
  const canScroll = event.deltaY > 0
    ? panel.scrollTop < maxScroll - 1
    : panel.scrollTop > 1;
  if (canScroll) event.stopPropagation();
}

/** Keep panels mounted so form state survives. Measure content, never the
 * animated container: one height transition, no exit/wait/remount sequence. */
export function FundTabs({ label, tabs, heightFrom, anchorId }: { label: string; tabs: FundTab[]; heightFrom?: string; anchorId?: string }) {
  const [active, setActive] = useState(0);
  const [height, setHeight] = useState<number>();
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const marks = useRef<(HTMLButtonElement | null)[]>([]);
  const still = useReducedMotion();
  const id = useId();
  const reference = heightFrom ? tabs.findIndex(tab => tab.key === heightFrom) : -1;
  const measuredIndex = reference >= 0 ? reference : active;

  useEffect(() => {
    const panel = panels.current[measuredIndex];
    if (!panel) return;
    const observer = new ResizeObserver(() => setHeight(panel.offsetHeight));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [measuredIndex]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (active + step + tabs.length) % tabs.length;
    setActive(next);
    marks.current[next]?.focus();
  };

  return (
    <div className="fund-switch" id={anchorId} data-height-from={heightFrom}>
      <div aria-label={label} className="fund-switch__tabs" onKeyDown={onKeyDown} role="tablist">
        {tabs.map((tab, index) => (
          <button aria-controls={`${id}-panel-${tab.key}`} aria-selected={index === active}
            className="fund-switch__tab" id={`${id}-tab-${tab.key}`} key={tab.key} data-fund-tab={tab.key}
            onClick={() => setActive(index)} ref={node => { marks.current[index] = node; }}
            role="tab" tabIndex={index === active ? 0 : -1} type="button">
            {tab.icon && <span className="fund-switch__icon" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {index === active && <motion.i aria-hidden="true" className="fund-switch__mark"
              layoutId={`${id}-mark`} transition={{ duration: still ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }} />}
          </button>
        ))}
      </div>
      <motion.div className="fund-switch__stage" initial={false} animate={{ height: height ?? "auto" }}
        transition={{ duration: still ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}>
        {tabs.map((tab, index) => (
          <div aria-labelledby={`${id}-tab-${tab.key}`} aria-hidden={index !== active}
            inert={index !== active} className="fund-switch__panel" data-active={index === active}
            data-scroll={reference >= 0 && index !== reference ? "true" : undefined}
            onWheel={reference >= 0 && index !== reference ? handlePanelWheel : undefined}
            id={`${id}-panel-${tab.key}`} key={tab.key} role="tabpanel" tabIndex={index === active ? 0 : -1}
            ref={node => { panels.current[index] = node; }}>
            {tab.panel}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
