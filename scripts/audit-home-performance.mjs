/**
 * Production Playwright audit for the long homepage.
 *
 * It uses fresh browser contexts, mobile UA/touch/DPR emulation, CDP CPU and
 * network throttling, Web Vitals observers, a full-page scroll benchmark and
 * the donation tab interaction that has historically regressed.
 *
 * Usage:
 *   node scripts/audit-home-performance.mjs \
 *     --base http://127.0.0.1:3010 \
 *     --label baseline
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const base = arg("--base", "http://127.0.0.1:3010");
const label = arg("--label", "audit").replaceAll(/[^a-z0-9_-]/gi, "-");
const outputDir = path.join("docs", "verification", "performance-audit");

const MOBILE_UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const profiles = [
  {
    name: "desktop-1440",
    viewport: { width: 1440, height: 900 },
    dpr: 1,
    cpu: 1,
    network: null,
  },
  {
    name: "tablet-768",
    viewport: { width: 768, height: 1024 },
    dpr: 2,
    cpu: 2,
    network: { latency: 40, downKbps: 9_000, upKbps: 4_000, type: "cellular4g" },
    mobile: true,
  },
  {
    name: "phone-390",
    viewport: { width: 390, height: 844 },
    dpr: 3,
    cpu: 4,
    network: { latency: 150, downKbps: 1_600, upKbps: 750, type: "cellular3g" },
    mobile: true,
  },
  {
    name: "low-end-android",
    viewport: { width: 360, height: 640 },
    dpr: 2,
    cpu: 6,
    network: { latency: 300, downKbps: 700, upKbps: 300, type: "cellular3g" },
    connection: { effectiveType: "3g", saveData: true },
    mobile: true,
  },
  {
    name: "weak-android-320",
    viewport: { width: 320, height: 568 },
    dpr: 2,
    cpu: 8,
    network: { latency: 450, downKbps: 400, upKbps: 160, type: "cellular2g" },
    connection: { effectiveType: "2g", saveData: true },
    mobile: true,
  },
];

const percentile = (values, fraction) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
};

const round = (value, precision = 0) => {
  const factor = 10 ** precision;
  return Math.round((Number(value) || 0) * factor) / factor;
};

async function auditProfile(browser, profile) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: profile.dpr,
    isMobile: Boolean(profile.mobile),
    hasTouch: Boolean(profile.mobile),
    userAgent: profile.mobile ? MOBILE_UA : undefined,
    locale: "ru-RU",
  });

  await context.addInitScript((connection) => {
    if (connection) {
      const emulatedConnection = {
        downlink: connection.effectiveType === "2g" ? 0.4 : 0.7,
        effectiveType: connection.effectiveType,
        onchange: null,
        rtt: connection.effectiveType === "2g" ? 450 : 300,
        saveData: connection.saveData,
        type: "cellular",
        addEventListener() {},
        removeEventListener() {},
      };
      Object.defineProperty(Navigator.prototype, "connection", {
        configurable: true,
        get: () => emulatedConnection,
      });
    }

    window.__lightyarAudit = {
      cls: 0,
      lcp: 0,
      lcpElement: "",
      longTasks: [],
    };

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__lightyarAudit.lcp = entry.startTime;
          const element = entry.element;
          window.__lightyarAudit.lcpElement = element
            ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
                typeof element.className === "string" && element.className
                  ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}`
                  : ""
              }`
            : "";
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__lightyarAudit.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__lightyarAudit.longTasks.push({
            start: entry.startTime,
            duration: entry.duration,
          });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {}
  }, profile.connection ?? null);

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (profile.network) {
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.network.latency,
      downloadThroughput: (profile.network.downKbps * 1024) / 8,
      uploadThroughput: (profile.network.upKbps * 1024) / 8,
      connectionType: profile.network.type,
    });
  }

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().split("\n")[0].slice(0, 220));
  });
  page.on("pageerror", (error) => pageErrors.push(String(error).split("\n")[0].slice(0, 220)));
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      reason: request.failure()?.errorText ?? "unknown",
      type: request.resourceType(),
    });
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      httpErrors.push({
        url: response.url(),
        status: response.status(),
        type: response.request().resourceType(),
      });
    }
  });

  const wallStart = Date.now();
  const response = await page.goto(`${base}/`, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(profile.mobile ? 3_000 : 2_000);

  const initial = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] ?? {};
    const paints = performance.getEntriesByType("paint");
    const resources = performance.getEntriesByType("resource");
    const audit = window.__lightyarAudit;
    const video = document.querySelector("video");
    const longTaskMs = audit.longTasks.reduce((sum, task) => sum + task.duration, 0);
    const resourceBytes = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    const videoResources = resources.filter((resource) => /\.mp4(?:\?|$)/i.test(resource.name));

    return {
      actualDevice: {
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        mobileUa: /Mobile|Android/i.test(navigator.userAgent),
        touchPoints: navigator.maxTouchPoints,
        effectiveType: navigator.connection?.effectiveType ?? null,
        saveData: navigator.connection?.saveData ?? false,
      },
      ttfb: navigation.responseStart || 0,
      domContentLoaded: navigation.domContentLoadedEventEnd || 0,
      load: navigation.loadEventEnd || 0,
      fcp: paints.find((entry) => entry.name === "first-contentful-paint")?.startTime || 0,
      lcp: audit.lcp,
      lcpElement: audit.lcpElement,
      cls: audit.cls,
      longTasks: audit.longTasks.length,
      longTaskMs,
      totalBlockingMs: audit.longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),
      domNodes: document.getElementsByTagName("*").length,
      resourceCount: resources.length,
      transferKb: resourceBytes / 1024,
      videoTransferKb: videoResources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0) / 1024,
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
      video: video
        ? {
            hasSource: Boolean(video.currentSrc),
            paused: video.paused,
            readyState: video.readyState,
            networkState: video.networkState,
          }
        : null,
    };
  });

  await page.screenshot({
    path: path.join(outputDir, `${label}-${profile.name}-hero.png`),
    fullPage: false,
  });

  const scroll = await page.evaluate(async () => {
    const startLongTaskIndex = window.__lightyarAudit.longTasks.length;
    const frameTimes = [];
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const duration = 4_000;
    let start = 0;
    let previous = 0;

    scrollTo(0, 0);
    await new Promise((resolve) => {
      const step = (now) => {
        if (!start) {
          start = now;
          previous = now;
        } else {
          frameTimes.push(now - previous);
          previous = now;
        }
        const progress = Math.min(1, (now - start) / duration);
        scrollTo(0, maxScroll * progress);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

    const scrollTasks = window.__lightyarAudit.longTasks.slice(startLongTaskIndex);
    return {
      frameTimes,
      maxScroll,
      longTasks: scrollTasks.length,
      longTaskMs: scrollTasks.reduce((sum, task) => sum + task.duration, 0),
    };
  });

  const donation = { available: false };
  const tabs = page.getByRole("tablist", { name: "Раздел помощи" });
  if ((await tabs.count()) > 0) {
    await tabs.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.getByRole("tab", { name: "Помочь" }).click();
    await page.waitForTimeout(350);
    const before = await page.evaluate(() => {
      const panel = document.querySelector(".donation-experience__panel");
      const dog = document.querySelector(".donation-pet");
      return {
        panelHeight: panel?.getBoundingClientRect().height ?? 0,
        dogVisible: dog ? getComputedStyle(dog).visibility !== "hidden" : false,
        scrollY,
      };
    });
    await page.getByRole("tab", { name: /Помощники/ }).click();
    await page.waitForTimeout(350);
    const after = await page.evaluate(() => {
      const panel = document.querySelector(".donation-experience__panel");
      const dog = document.querySelector(".donation-pet");
      return {
        panelHeight: panel?.getBoundingClientRect().height ?? 0,
        dogVisible: dog ? getComputedStyle(dog).visibility !== "hidden" : false,
        feedActive: document.querySelector("#donation-panel-feed")?.getAttribute("data-active"),
        scrollY,
      };
    });
    Object.assign(donation, {
      available: true,
      before,
      after,
      stableHeight: Math.abs(before.panelHeight - after.panelHeight) < 1,
      stableScroll: Math.abs(before.scrollY - after.scrollY) < 1,
    });
  }

  const frameTimes = scroll.frameTimes.filter((duration) => duration > 0 && duration < 1_000);
  const meanFrame = frameTimes.reduce((sum, duration) => sum + duration, 0) / Math.max(1, frameTimes.length);
  const result = {
    profile: profile.name,
    requested: {
      viewport: profile.viewport,
      dpr: profile.dpr,
      cpuSlowdown: profile.cpu,
      network: profile.network,
      connection: profile.connection ?? null,
    },
    status: response?.status() ?? 0,
    wallMs: Date.now() - wallStart,
    initial: {
      ...initial,
      ttfb: round(initial.ttfb),
      domContentLoaded: round(initial.domContentLoaded),
      load: round(initial.load),
      fcp: round(initial.fcp),
      lcp: round(initial.lcp),
      cls: round(initial.cls, 4),
      longTaskMs: round(initial.longTaskMs),
      totalBlockingMs: round(initial.totalBlockingMs),
      transferKb: round(initial.transferKb),
      videoTransferKb: round(initial.videoTransferKb),
    },
    scroll: {
      averageFps: round(1_000 / Math.max(1, meanFrame), 1),
      p95FrameMs: round(percentile(frameTimes, 0.95), 1),
      p99FrameMs: round(percentile(frameTimes, 0.99), 1),
      framesOver32ms: frameTimes.filter((duration) => duration > 32).length,
      framesOver50ms: frameTimes.filter((duration) => duration > 50).length,
      longTasks: scroll.longTasks,
      longTaskMs: round(scroll.longTaskMs),
      maxScroll: round(scroll.maxScroll),
    },
    donation,
    consoleErrors: [...new Set(consoleErrors)],
    pageErrors: [...new Set(pageErrors)],
    failedRequests: failedRequests.slice(0, 20),
    httpErrors: httpErrors.slice(0, 20),
  };

  await cdp.detach();
  await context.close();
  return result;
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

for (const profile of profiles) {
  process.stderr.write(`auditing ${profile.name}\n`);
  results.push(await auditProfile(browser, profile));
}

await browser.close();

const report = {
  label,
  base,
  generatedAt: new Date().toISOString(),
  note: "CPU/network emulation runs on desktop hardware; real low-end Android GPU performance can be worse.",
  results,
};

const outputPath = path.join(outputDir, `${label}.json`);
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
console.error(`saved ${outputPath}`);
