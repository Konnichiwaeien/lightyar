# Homepage Layout Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the seven approved homepage visual corrections while preserving the rescued-ring motion algorithm and all existing form behavior.

**Architecture:** Keep each existing React section and change only its copy and CSS geometry. Extend the existing source-contract tests before each production edit, then verify the final geometry in the running browser across the requested viewport matrix.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Framer Motion, Node test runner, in-app browser QA.

---

### Task 1: Lock the About and rescued-ring requirements with failing tests

**Files:**
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`
- Test: `components/sections/homepage-responsive-feedback.test.mjs`

- [ ] **Step 1: Replace the old panorama and ring assertions with the new contract**

```js
assert.match(globals, /\.about-panorama\s*\{[\s\S]*?aspect-ratio:\s*24\s*\/\s*17/);
assert.match(globals, /@media \(min-width:\s*48rem\)[\s\S]*?\.about-panorama\s*\{[\s\S]*?aspect-ratio:\s*12\s*\/\s*5/);
assert.match(globals, /\.about-section\s*\{[^}]*background:\s*#fff/);
assert.match(ringCss, /\.ring\s*\{[\s\S]*?background:\s*#fff/);
assert.match(ringCss, /\.ring-mark\s*\{[\s\S]*?display:\s*inline-flex[\s\S]*?align-items:\s*center/);
assert.match(ring, /Забираем с улицы\. Лечим\./);
assert.match(ring, /ring-aside__lead-accent[^>]*>Ищем дом\./);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test components/sections/homepage-responsive-feedback.test.mjs`

Expected: FAIL because the current ratios, backgrounds, marker alignment, and lead copy still use the old design.

### Task 2: Implement About and rescued-ring presentation

**Files:**
- Modify: `app/globals.css`
- Modify: `components/sections/about-section.tsx`
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`

- [ ] **Step 1: Apply responsive panorama geometry and white About sheet**

```css
.about-section { background: #fff; }
.about-panorama { aspect-ratio: 24 / 17; }
.about-panorama img { object-position: 50% 72%; }

@media (min-width: 48rem) {
  .about-panorama { aspect-ratio: 12 / 5; }
  .about-panorama img { object-position: 50% 70%; }
}
```

- [ ] **Step 2: Replace the lead and add an accent span**

```tsx
<p className="ring-aside__lead">
  Забираем с улицы. Лечим. <span className="ring-aside__lead-accent">Ищем дом.</span>
</p>
```

- [ ] **Step 3: Make the ring sheet white and center marker numerals**

```css
.ring { background: #fff; }
.ring-mark {
  display: inline-flex;
  min-height: 1.18em;
  align-items: center;
  justify-content: center;
  line-height: 1;
  vertical-align: 0.06em;
}
.ring-aside__lead-accent {
  position: relative;
  display: inline-block;
  z-index: 0;
}
.ring-aside__lead-accent::after {
  position: absolute;
  z-index: -1;
  right: -0.06em;
  bottom: 0.04em;
  left: -0.06em;
  height: 0.18em;
  border-radius: 50%;
  background: var(--ring-amber);
  content: "";
  transform: rotate(-1.2deg);
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test components/sections/homepage-responsive-feedback.test.mjs`

Expected: PASS for the new About and rescued-ring assertions.

### Task 3: Lock and implement the compact donation form

**Files:**
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`
- Modify: `components/donations/donation-experience.css`

- [ ] **Step 1: Add failing donation layout assertions**

```js
assert.match(donationCss, /\.donation-experience__panel\s*\{[\s\S]*?min-height:\s*42rem/);
assert.match(donationCss, /\.donation-experience__panel::before\s*\{[\s\S]*?z-index:\s*2/);
assert.match(donationCss, /\.donation-pet\s*\{[\s\S]*?z-index:\s*1/);
assert.match(donationCss, /\.donation-tier--custom\s*\{[^}]*grid-column:\s*auto/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test components/sections/homepage-responsive-feedback.test.mjs`

Expected: FAIL because the panel is 48 rem tall, the dog is above the surface, and custom amount spans both columns.

- [ ] **Step 3: Compact desktop spacing and tier cards**

```css
.donation-experience__panel { min-height: 42rem; isolation: isolate; }
.donation-experience__form {
  z-index: 3;
  width: min(62%, 48rem);
  gap: clamp(0.8rem, 1.1vw, 1rem);
  padding: clamp(1.6rem, 2.4vw, 2.6rem);
}
.donation-tier { min-height: 6.25rem; padding: 0.8rem; }
.donation-tier--custom { grid-column: auto; min-height: 6.25rem; }
```

- [ ] **Step 4: Layer the dog behind the panel surface**

```css
.donation-experience__panel::before {
  position: absolute;
  z-index: 2;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(145deg, rgba(255,248,232,.97), rgba(255,253,248,.98));
  content: "";
  pointer-events: none;
}
.donation-pet { z-index: 1; top: 0; transform: translateY(-52%); }
```

Use the existing tablet/mobile media queries to keep the dog smaller and away from all controls.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `node --test components/sections/homepage-responsive-feedback.test.mjs`

Expected: PASS for donation geometry and layering.

### Task 4: Lock and implement the Few and Far-inspired volunteer panel

**Files:**
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`
- Modify: `components/sections/volunteer-section.tsx`
- Modify: `components/sections/volunteer-section.css`

- [ ] **Step 1: Add failing editorial-panel assertions**

```js
assert.match(volunteerCss, /\.volunteer-action-panel\s*\{[\s\S]*?background:\s*rgba\(255,\s*252,\s*245/);
assert.match(volunteerCss, /\.volunteer-action-panel ol\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3/);
assert.match(volunteerCss, /\.volunteer-role\s*\{[\s\S]*?background:\s*transparent/);
assert.match(volunteerCss, /\.volunteer-role__number\s*\{[\s\S]*?color:\s*#f59e0b/);
assert.match(volunteerCss, /@media \(max-width:\s*960px\)[\s\S]*?\.volunteer-action-panel ol\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test components/sections/homepage-responsive-feedback.test.mjs`

Expected: FAIL because the current panel is a dark transparent strip.

- [ ] **Step 3: Convert the role list to one warm-white editorial sheet**

```css
.volunteer-action-panel {
  width: min(80rem, calc(100% - 2rem));
  margin-inline: auto;
  padding: clamp(1rem, 2vw, 1.5rem);
  border: 1px solid rgba(255,255,255,.72);
  border-radius: 1rem;
  background: rgba(255, 252, 245, 0.94);
  color: #1c1c1c;
  box-shadow: 0 1.5rem 4rem rgba(12,9,6,.2);
}
.volunteer-action-panel ol {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 0;
  background: transparent;
  box-shadow: none;
}
.volunteer-role {
  min-height: 8rem;
  border-right: 1px solid rgba(47,39,30,.18);
  background: transparent;
  color: #1c1c1c;
}
.volunteer-role__number { color: #f59e0b; }
.volunteer-role p { color: rgba(28,28,28,.66); }
```

- [ ] **Step 4: Keep the staggered entrance and replace card hover with number/underline motion**

```css
.volunteer-role::after { transform: scaleX(0); }
.volunteer-role:hover::after,
.volunteer-role:focus-within::after { transform: scaleX(1); }
.volunteer-role:hover .volunteer-role__number,
.volunteer-role:focus-within .volunteer-role__number { transform: translateY(-0.2rem); }
```

- [ ] **Step 5: Stack the sheet as rows on tablet and mobile**

```css
@media (max-width: 960px) {
  .volunteer-action-panel ol { grid-template-columns: 1fr; }
  .volunteer-role { border-right: 0; border-bottom: 1px solid rgba(47,39,30,.16); }
}
```

- [ ] **Step 6: Run the focused test and verify GREEN**

Run: `node --test components/sections/homepage-responsive-feedback.test.mjs`

Expected: PASS for the new volunteer panel contract.

### Task 5: Regression and real-browser verification

**Files:**
- Modify if required by measured regressions: `components/sections/rescued-ring.css`
- Modify if required by measured regressions: `components/donations/donation-experience.css`
- Modify if required by measured regressions: `components/sections/volunteer-section.css`

- [ ] **Step 1: Run the complete automated checks**

Run: `npm.cmd test`

Expected: all Node tests pass.

Run: `npm.cmd run lint`

Expected: ESLint exits 0 with no warnings introduced by these changes.

Run: `npm.cmd run typecheck`

Expected: TypeScript exits 0.

- [ ] **Step 2: Inspect the live homepage at every required width**

Use widths `320`, `390`, `557`, `768`, `1024`, `1440`, and `1920` and inspect `#about`, `#rescued`, `#donate`, and `#volunteer`.

Expected at every width:

```text
document.documentElement.scrollWidth === document.documentElement.clientWidth
panorama contains visible people and dogs
79 and 72 are centered in their marker boxes
rescued portraits move without jitter
dog does not cover donation controls
custom amount is not full-row on desktop
volunteer roles are fully readable and the outer panel edges are sharp
```

- [ ] **Step 3: Re-run focused tests after any visual adjustment**

Run: `node --test components/sections/homepage-responsive-feedback.test.mjs`

Expected: PASS.

No commits are created unless the user explicitly requests one.
