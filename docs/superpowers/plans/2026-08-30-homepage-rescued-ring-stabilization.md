# Homepage Rescued Ring Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the interrupted rescued-ring work by restoring local hydration, proving the real desktop/mobile states in a browser, and fixing only confirmed responsive layout defects.

**Architecture:** Keep `app/page.tsx` as the Server Component that fetches and passes pet statistics. Keep `RescuedRing` as the isolated Client Component for scroll state and motion. Treat desktop as the approved sticky scrollytelling scene from `docs/effects.md`; below 900 px, render the same content as a readable document-flow composition with decorative motion disabled. The existing uncommitted work is preserved and no unrelated files are rewritten.

**Tech Stack:** Next.js 16 App Router, React 19, Framer Motion 12, component-scoped CSS, Node test runner, Playwright Core with installed Chrome.

---

### Task 1: Restore honest local browser verification

**Files:**
- Modify: `app/deploy-readiness.test.mjs`
- Modify: `next.config.ts`

- [x] **Step 1: Write the failing CSP contract test**

Add a source-level contract next to the existing security-header test. It must require `unsafe-eval` only inside the `NODE_ENV === "development"` branch and must reject an unconditional production directive:

```js
test("development CSP permits the webpack evaluator without weakening production", async () => {
  const config = await read("../next.config.ts");

  assert.match(config, /script-src[^\n]+NODE_ENV\s*===\s*["']development["'][\s\S]+unsafe-eval/);
  assert.doesNotMatch(config, /["']script-src 'self' 'unsafe-inline' 'unsafe-eval'["']/);
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```powershell
& 'C:\Users\Neversummer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test app/deploy-readiness.test.mjs
```

Expected: the new test fails because `next.config.ts` currently emits `script-src 'self' 'unsafe-inline'` for every environment.

- [x] **Step 3: Make the CSP environment-aware**

Build the script directive with a development-only suffix:

```ts
const developmentScriptPolicy =
  process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

const contentSecurityPolicy = [
  // ...unchanged directives...
  `script-src 'self' 'unsafe-inline'${developmentScriptPolicy}`,
  // ...unchanged directives...
].join("; ");
```

Do not add `unsafe-eval` to production.

- [x] **Step 4: Verify GREEN and restart the dev server**

Run the focused test again, restart the webpack dev server, fetch `/`, and confirm the response CSP contains `unsafe-eval` in development. Open the page and confirm the earlier CSP `EvalError` is gone.

---

### Task 2: Add a browser regression contract for the rescued ring

**Files:**
- Create: `scripts/check-rescued-ring-layout.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the failing Playwright check**

The script must open `http://localhost:3000`, wait for hydration, and evaluate `#rescued` at 1440×900, 768×900, 390×844, and 320×700. It must assert:

```js
const visible = (rect) => rect.width > 0 && rect.height > 0;
const overlaps = (a, b) =>
  Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
  Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);

// Desktop final phase: orbit, center and aside are visible, and text columns do not overlap.
assert.equal(visible(orbitRect), true);
assert.equal(visible(centerRect), true);
assert.equal(visible(asideRect), true);
assert.equal(overlaps(centerRect, asideRect), false);

// Narrow layout: the aside participates in flow and is not clipped by max-height.
assert.equal(getComputedStyle(aside).position, "static");
assert.equal(aside.scrollHeight, aside.clientHeight);
assert.ok(sectionRect.height >= stageRect.height);
```

Also collect page errors, failed local image requests, `document.documentElement.scrollWidth`, and the rendered counter text. Fail on hydration errors, local 4xx/5xx assets, horizontal overflow, or zero counters when the server supplied non-zero statistics.

- [x] **Step 2: Run the browser check and verify RED**

Run:

```powershell
& 'C:\Users\Neversummer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/check-rescued-ring-layout.mjs http://localhost:3000
```

Expected: after hydration is restored, any remaining desktop overlap or narrow-screen clipping fails with measured rectangles.

- [x] **Step 3: Add the repeatable command**

Add `"test:ring-layout": "node scripts/check-rescued-ring-layout.mjs http://localhost:3000"` to `package.json` without changing dependency versions.

---

### Task 3: Fix the confirmed responsive composition

**Files:**
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`
- Test: `scripts/check-rescued-ring-layout.mjs`

- [x] **Step 1: Separate the visual canvas from document-flow content**

Wrap the orbit and center copy in a `.ring-visual` container. Keep `.ring-aside` as a sibling inside `.ring-stage`:

```tsx
<div className="ring-stage">
  <div className="ring-visual">
    <div className="ring-fit" aria-hidden="true">...</div>
    <motion.div className="ring-center">...</motion.div>
  </div>
  <motion.div className="ring-aside">...</motion.div>
  <div className="ring-gather" aria-hidden="true">...</div>
</div>
```

This gives the mobile layout a real-height visual block followed by real-height text instead of multiple grid children occupying the same cell.

- [x] **Step 2: Keep the approved desktop sticky behavior**

On desktop, `.ring-visual` fills the stage and `.ring-aside` remains absolute. Constrain the shifted center copy to the left half before tuning any translation. Animate only compositor properties (`transform`, `opacity`) and retain the existing Framer Motion scroll values.

- [x] **Step 3: Make the narrow layout deterministic**

At `max-width: 900px`:

```css
.ring-stage {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: none;
  aspect-ratio: auto;
}

.ring-visual {
  position: relative;
  width: min(440px, 100%);
  aspect-ratio: 440 / 700;
}

.ring-center,
.ring-orbit,
.ring-aside {
  transform: none !important;
}

.ring-aside {
  position: static;
  max-height: none;
  overflow: visible;
  opacity: 1 !important;
}
```

The orbit may remain decorative, but all headings, body text and CTA must be present without requiring scroll-driven JavaScript. Keep the existing `prefers-reduced-motion` path fully readable.

- [x] **Step 4: Run the browser check and iterate one measured defect at a time**

Re-run `scripts/check-rescued-ring-layout.mjs`. If a check fails, record the rectangles, change one layout variable, and re-run. Do not bundle unrelated homepage styling into this task.

---

### Task 4: Documentation and full verification

**Files:**
- Modify: `docs/effects.md`
- Modify: `docs/03-component-inventory.md`

- [x] **Step 1: Update the current-state docs**

Document the actual home order with `RescuedRing`, the desktop sticky/narrow flow split, the dev-only CSP rule, and the browser matrix used for acceptance. Remove the stale statement that wishlist imagery is missing; the current code uses the installed WebP set.

- [x] **Step 2: Run static verification**

Run:

```powershell
& 'C:\Users\Neversummer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test app/deploy-readiness.test.mjs
& 'C:\Users\Neversummer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test components/ui/cursor-context.test.mjs components/ui/brand-logo.test.mjs
```

Then run the project `test`, `lint`, and production `build` scripts through the available Node runtime.

- [x] **Step 3: Run browser acceptance**

Run the rescued-ring layout check and capture desktop/mobile screenshots at the start, settled ring, shifted story, and exit states. Verify 320, 390, 768 and 1440 px, no horizontal overflow, no console/page errors caused by local code, all local media 200, and readable reduced-motion output.

- [x] **Step 4: Inspect the changed files**

Run `git diff --check` and inspect the exact diff for the files above. Do not commit: the checkout already contains a large mixed set of uncommitted user/agent changes and the user did not request a commit.

**Verification result (30 August 2026):** 50/50 project tests pass; changed files
pass ESLint; the browser contract passes at 1440, 768, 390 and 320 px plus
desktop reduced motion. The production compiler and TypeScript pass. Full-site
prerender remains blocked on pre-existing dynamic news routes while local Strapi
at `localhost:1443` is offline. Git diff is unavailable because the checkout's
`.git` directory exposes no repository metadata in this environment, so the
listed files were inspected directly and left uncommitted.
