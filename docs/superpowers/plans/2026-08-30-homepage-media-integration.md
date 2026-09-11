# Homepage Media Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the five unused homepage photographs and the final paper-grain tile without changing the homepage data flow, copy, payment behavior, or accepted rescued-ring composition.

**Architecture:** Keep the existing section client boundaries and add responsive, semantic media markup directly beside the content it supports. `next/image` owns every JPEG consumer, Tailwind utilities own local geometry, and the existing global `.film-grain` rule is the only global style changed. A source-level contract protects asset paths and semantics; a Playwright acceptance script protects real browser geometry from 320 through 1920 px.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `next/image`, Node test runner, Playwright Core, installed Chrome.

**Execution note:** Work in the current checkout because the homepage and asset masters depend on uncommitted prior work already present here. Do not commit, reset, move, or clean the mixed worktree.

---

### Task 1: Lock the six-asset contract before production edits

**Files:**
- Create: `components/sections/homepage-media-structure.test.mjs`
- Create: `scripts/check-homepage-media-layout.mjs`
- Modify: `package.json`
- Test: `components/sections/homepage-media-structure.test.mjs`
- Test: `scripts/check-homepage-media-layout.mjs`

- [ ] **Step 1: Write failing source-level tests**

Create tests that read the three sections plus `app/globals.css` and assert the exact asset paths, About list/figure semantics, explicit `sizes`, decorative volunteer alt, descriptive donation/About alternatives, and PNG-based grain without inline SVG turbulence:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("About renders the documentary triptych as a semantic list", async () => {
  const source = await read("./about-section.tsx");
  for (const asset of ["/about/moment-1.jpg", "/about/moment-2.jpg", "/about/moment-3.jpg"]) {
    assert.match(source, new RegExp(asset.replaceAll("/", "\\/")));
  }
  assert.match(source, /className="about-moments/);
  assert.match(source, /<ul[\s\S]*ABOUT_MOMENTS\.map[\s\S]*<figure/);
  assert.match(source, /sizes="\(max-width: 767px\) 84vw/);
});

test("Donation and volunteer scenes use responsive Next images", async () => {
  const [payment, volunteer] = await Promise.all([
    read("./payment-section.tsx"),
    read("./volunteer-section.tsx"),
  ]);
  assert.match(payment, /import Image from "next\/image"/);
  assert.match(payment, /src="\/donate\/companion\.jpg"/);
  assert.match(payment, /alt="Собака под опекой фонда ждёт помощи"/);
  assert.match(payment, /className="donation-companion/);
  assert.match(volunteer, /src="\/volunteer\/walk\.jpg"/);
  assert.match(volunteer, /alt=""/);
  assert.match(volunteer, /sizes="100vw"/);
});

test("Film grain uses the installed tile", async () => {
  const css = await read("../../app/globals.css");
  assert.match(css, /background-image:\s*url\("\/texture\/paper-grain\.png"\)/);
  assert.match(css, /opacity:\s*0\.04/);
  assert.doesNotMatch(css, /feTurbulence|data:image\/svg\+xml/);
});
```

- [ ] **Step 2: Run the source contract and confirm RED**

Run:

```powershell
& $nodeExe --test components/sections/homepage-media-structure.test.mjs
```

Expected: FAIL because the new asset consumers and final grain URL do not yet exist.

- [ ] **Step 3: Write the browser acceptance harness**

The script must launch installed Chrome, intercept local asset responses, visit `/` at 320, 390, 768, 1440, and 1920 px, and check these invariants:

```js
const viewports = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
];

const selectors = {
  about: ".about-moments",
  donation: ".donation-companion",
  volunteer: ".volunteer-scene",
};

assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
assert.equal(await page.locator(".about-moment figure").count(), 3);
assert.equal(await page.locator(".donation-companion img").evaluate((img) => img.complete && img.naturalWidth > 0), true);
assert.equal(await page.locator(".volunteer-scene img").evaluate((img) => img.complete && img.naturalWidth > 0), true);
```

It must also assert approximately 4:5 About crops, 4:3 donation media below 640 px, 16:9 from 640–1279 px, a three-column donation grid at 1280 px and above, no form/feed clipping, no page errors, and equal content under `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Add a package script without changing existing scripts**

Add exactly:

```json
"test:home-media": "node scripts/check-homepage-media-layout.mjs http://localhost:3000"
```

- [ ] **Step 5: Run the browser harness against the pre-change page and confirm RED**

Run the webpack dev server with the bundled Node runtime, then run:

```powershell
& $nodeExe scripts/check-homepage-media-layout.mjs http://localhost:3000
```

Expected: FAIL on the missing `.about-moments`, `.donation-companion`, and `.volunteer-scene` selectors.

### Task 2: Add the About documentary triptych

**Files:**
- Modify: `components/sections/about-section.tsx`
- Test: `components/sections/homepage-media-structure.test.mjs`

- [ ] **Step 1: Hoist immutable image descriptors**

Add the descriptor array outside the component so it is not recreated on every render:

```tsx
const ABOUT_MOMENTS = [
  { src: "/about/moment-1.jpg", alt: "Волонтёр расчёсывает собаку", position: "object-center" },
  { src: "/about/moment-2.jpg", alt: "Кошка отдыхает на тёплом пледе", position: "object-center" },
  { src: "/about/moment-3.jpg", alt: "Собака смотрит на волонтёра перед прогулкой", position: "object-[50%_45%]" },
] as const;
```

- [ ] **Step 2: Render the list immediately after the panorama**

Add a class-marked semantic list. Mobile items are 84% wide and alternate alignment; the tablet/desktop layout becomes a staggered three-column grid. Each `figure` reserves a 4:5 ratio and each image retains lazy loading by omitting `priority`:

```tsx
<ul className="about-moments mt-14 grid w-full grid-cols-1 gap-8 pb-4 md:mt-20 md:grid-cols-3 md:gap-5 md:pb-12 lg:gap-8">
  {ABOUT_MOMENTS.map((moment, index) => (
    <li
      key={moment.src}
      className={`about-moment w-[min(84%,24rem)] ${index === 1 ? "ml-auto md:translate-y-10" : "mr-auto"} ${index === 2 ? "md:-translate-y-5" : ""} md:w-full`}
    >
      <span aria-hidden="true" className="mb-3 block h-0.5 w-10 rounded-full bg-[#F5A623]" />
      <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
        <Image
          src={moment.src}
          alt={moment.alt}
          fill
          sizes="(max-width: 767px) 84vw, (max-width: 1279px) 29vw, 380px"
          className={`object-cover ${moment.position}`}
        />
      </figure>
    </li>
  ))}
</ul>
```

- [ ] **Step 3: Run the About source contract**

Run:

```powershell
& $nodeExe --test --test-name-pattern="About renders" components/sections/homepage-media-structure.test.mjs
```

Expected: PASS.

### Task 3: Add the donation companion media rail

**Files:**
- Modify: `components/sections/payment-section.tsx`
- Test: `components/sections/homepage-media-structure.test.mjs`

- [ ] **Step 1: Import Next Image directly**

```tsx
import Image from "next/image";
```

- [ ] **Step 2: Turn the unified card into a responsive media/form/feed composition**

Keep all form and live-feed JSX unchanged inside their existing elements. Make the direct layout container flex below 1280 px and grid at 1280 px. Use `xl:contents` on a single form/feed wrapper so the desktop columns are 24/47/29 with a feed and 30/70 without one:

```tsx
<div className={`donation-card-layout flex flex-col items-stretch xl:grid ${hasDonations ? "xl:grid-cols-[24%_47%_29%]" : "xl:grid-cols-[30%_70%]"}`}>
  <figure className="donation-companion relative aspect-[4/3] overflow-hidden border-b border-stone-200 bg-stone-900 sm:aspect-video xl:aspect-auto xl:min-h-full xl:border-r xl:border-b-0">
    <Image
      src="/donate/companion.jpg"
      alt="Собака под опекой фонда ждёт помощи"
      fill
      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 92vw, 30vw"
      className="object-cover object-[50%_28%]"
    />
    <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-stone-950/40 via-transparent to-stone-950/10" />
  </figure>
  <div className="flex flex-col items-stretch lg:flex-row xl:contents">
    <form className={`w-full ${hasDonations ? "lg:w-7/12" : ""} xl:w-full ...`}>
    </form>
    {hasDonations ? <div className="w-full lg:w-5/12 xl:w-full ...">...</div> : null}
  </div>
</div>
```

- [ ] **Step 3: Keep responsive borders aligned with the new hierarchy**

The feed retains a top border on stacked mobile/tablet layouts and a left border beside the form from `lg` upward. The media rail owns the card's top crop below `xl` and its left crop at `xl`; no text or controls are layered over the dog's face.

- [ ] **Step 4: Run the donation source contract**

Run:

```powershell
& $nodeExe --test --test-name-pattern="Donation and volunteer" components/sections/homepage-media-structure.test.mjs
```

Expected: still FAIL only on the not-yet-implemented volunteer asset, while every donation-specific assertion passes.

### Task 4: Replace the volunteer placeholder and temporary grain

**Files:**
- Modify: `components/sections/volunteer-section.tsx`
- Modify: `app/globals.css`
- Test: `components/sections/homepage-media-structure.test.mjs`

- [ ] **Step 1: Render the volunteer scene as a decorative responsive image**

Import `Image` from `next/image`, add a minimum section height, and replace the brown placeholder with:

```tsx
<div className="volunteer-scene absolute inset-0 z-0">
  <Image
    src="/volunteer/walk.jpg"
    alt=""
    fill
    sizes="100vw"
    className="object-cover object-[50%_50%] md:object-[50%_54%]"
  />
  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,16,14,0.82)_0%,rgba(18,16,14,0.5)_48%,rgba(18,16,14,0.2)_100%)]" />
  <div className="absolute inset-0 bg-linear-to-b from-stone-950/35 via-transparent to-stone-950/75" />
</div>
```

Keep the existing heading, paragraph and mail link exactly as they are.

- [ ] **Step 2: Replace inline turbulence with the installed tile**

Change only the `.film-grain` declaration:

```css
.film-grain {
  position: fixed;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  opacity: 0.04;
  mix-blend-mode: multiply;
  background-image: url("/texture/paper-grain.png");
  background-repeat: repeat;
  background-size: 512px 512px;
}
```

- [ ] **Step 3: Run the full source contract and confirm GREEN**

Run:

```powershell
& $nodeExe --test components/sections/homepage-media-structure.test.mjs
```

Expected: all source-contract tests PASS.

### Task 5: Verify compilation, behavior, geometry, and visual output

**Files:**
- Modify only if a measured defect requires it: `components/sections/about-section.tsx`
- Modify only if a measured defect requires it: `components/sections/payment-section.tsx`
- Modify only if a measured defect requires it: `components/sections/volunteer-section.tsx`
- Modify only if a measured defect requires it: `app/globals.css`
- Create: `docs/verification/homepage-media/about-320.png`
- Create: `docs/verification/homepage-media/about-1440.png`
- Create: `docs/verification/homepage-media/donate-320.png`
- Create: `docs/verification/homepage-media/donate-1440.png`
- Create: `docs/verification/homepage-media/volunteer-320.png`
- Create: `docs/verification/homepage-media/volunteer-1440.png`

- [ ] **Step 1: Run the focused source contract and existing project tests**

```powershell
& $nodeExe --test components/sections/homepage-media-structure.test.mjs
& $nodeExe --experimental-strip-types --test lib/reports/report-domain.test.ts lib/reports/normalize-report.test.ts lib/reports/pet-stats.test.ts lib/about/about-content.test.ts lib/security/rate-limit.test.ts lib/api/services/editorial-services.test.mjs components/reports/reports-structure.test.mjs components/about/about-structure.test.mjs app/navigation-contract.test.mjs app/deploy-readiness.test.mjs components/ui/cursor-context.test.mjs components/ui/brand-logo.test.mjs
```

Expected: both commands PASS.

- [ ] **Step 2: Run targeted lint and TypeScript compilation**

```powershell
& $nodeExe node_modules/eslint/bin/eslint.js components/sections/about-section.tsx components/sections/payment-section.tsx components/sections/volunteer-section.tsx components/sections/homepage-media-structure.test.mjs scripts/check-homepage-media-layout.mjs
& $nodeExe node_modules/typescript/bin/tsc --noEmit
```

Expected: zero new errors. If the repository-wide TypeScript command exposes pre-existing failures, record them separately and prove the changed files compile through the Next webpack route.

- [ ] **Step 3: Run the five-width browser acceptance matrix**

```powershell
& $nodeExe scripts/check-homepage-media-layout.mjs http://localhost:3000
```

Expected: PASS at 320, 390, 768, 1440, and 1920 px, with all six asset responses successful, no page overflow, no runtime/page errors, preserved form visibility, and identical reduced-motion content.

- [ ] **Step 4: Capture six section screenshots**

Use the acceptance browser to scroll each section into view and save clipped screenshots at 320 and 1440 px to `docs/verification/homepage-media/`. Wait for each relevant image to report `complete && naturalWidth > 0` before capture.

- [ ] **Step 5: Inspect screenshots and tune only measured defects**

Inspect all six PNGs. If a face, hand, leash, person, dog, control, or CTA is clipped, adjust only the responsible `object-position`, aspect ratio, spacing, or overlay opacity and rerun Steps 1–4. Do not introduce new copy, animation, data flow, or media.

- [ ] **Step 6: Leave the webpack dev server running for review**

Run in a persistent PTY:

```powershell
& $nodeExe .\node_modules\next\dist\bin\next dev --webpack
```

Expected: Next reports the local URL, `/` returns 200, and the user can inspect the finished homepage.
