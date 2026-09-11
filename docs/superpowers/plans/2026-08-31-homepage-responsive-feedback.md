# Homepage Responsive Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the eight screenshot-backed responsive defects across the hero, About, rescued ring, pet stories, and donation form without changing CMS data or payment behavior.

**Architecture:** Keep the existing section boundaries and data flow. Apply targeted JSX/Tailwind changes where the layout is local to a component, CSS changes where a component already owns a stylesheet, and one source-contract test that protects the screenshot-specific rules. Mobile remains a deliberately composed layout, not a scaled desktop fallback.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, component CSS, Framer Motion, Node test runner.

**Project constraint:** Do not commit. The working tree contains user-owned changes and the user requested implementation in the current checkout.

---

### Task 1: Add a responsive feedback source contract

**Files:**
- Create: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1: Write the failing contract**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("screenshot feedback remains encoded in the homepage sections", async () => {
  const [hero, about, ring, ringCss, stories, donationCss] = await Promise.all([
    read("./hero-section.tsx"),
    read("./about-section.tsx"),
    read("./rescued-ring.tsx"),
    read("./rescued-ring.css"),
    read("./dogs-stories-section.tsx"),
    read("../donations/donation-experience.css"),
  ]);

  assert.match(hero, /whitespace-nowrap/);
  assert.doesNotMatch(about, /ABOUT_MOMENTS|about-moments/);
  assert.match(about, /text-\[#F5A623\][^\n]*>большое/);
  assert.match(about, /aspect-\[3\/2\]/);
  assert.doesNotMatch(about, /font-light opacity-60/);
  assert.match(ring, /const still = Boolean\(reduced\);/);
  assert.match(ringCss, /--ring-h: 520/);
  assert.match(stories, /svh/);
  assert.match(donationCss, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});
```

- [x] **Step 2: Run the test and confirm it fails**

Run:
```powershell
& $nodeExe --test components/sections/homepage-responsive-feedback.test.mjs
```

Expected: FAIL on the current wrapping, moments, mobile ring, fixed card height, and mobile donation rules.

### Task 2: Make hero controls unbreakable at every width

**Files:**
- Modify: `components/sections/hero-section.tsx`
- Test: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1: Replace the mobile action row with a constrained three-column grid**

Use `grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)]`, smaller mobile gaps and padding, `shrink-0`, and both `whitespace-nowrap` and `text-wrap: nowrap` fallback semantics through Tailwind's no-wrap utility.

- [x] **Step 2: Run the focused source contract**

Expected: the hero assertion passes and no other assertion regresses.

### Task 3: Repair About contrast, typography, statistics, and panorama

**Files:**
- Modify: `components/sections/about-section.tsx`
- Modify: `app/globals.css`
- Modify: `components/sections/homepage-media-structure.test.mjs`
- Test: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1: Move the orange accent from “дело” to “большое”**

Keep “дело” italic and dark enough to read. Remove parent `opacity-60` from the paragraph and give body copy an explicit readable stone colour.

- [x] **Step 2: Keep the three statistics from colliding**

Use smaller portrait and number sizes below 1024 px, smaller gaps, and reserve the largest 9rem portraits and 7xl figures for large screens.

- [x] **Step 3: First-pass panorama increase (superseded by Task 9)**

The first pass replaced 21:9 with 3:2. Task 9 supersedes that reviewed result
with the current 6:5 contract. Keep `object-cover` and the existing responsive
Next Image contract.

- [x] **Step 4: Remove the three-photo `about-moments` strip**

Delete `ABOUT_MOMENTS`, its rendered list, and obsolete test assertions. Keep the main panorama as the single About image.

### Task 4: Restore a real compact mobile rescued ring

**Files:**
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`
- Test: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1: Stop treating every compact viewport as reduced motion**

Change `still` to depend only on `prefers-reduced-motion`. On compact screens keep portraits on the path rather than applying the desktop scatter offsets.

- [x] **Step 2: Replace the 440×700 mobile path with a 440×520 oval**

Set `--ring-portrait: 112px`, `--ring-h: 520`, a matching stage aspect ratio, and a compact oval path that keeps all portraits visible around the central copy.

- [x] **Step 3: Preserve the normal-flow text column below the ring**

Do not restore the desktop side-shift on mobile. Only the orbit moves; the long foundation copy remains below and readable.

### Task 5: Make pet cards consume the useful viewport height

**Files:**
- Modify: `components/sections/dogs-stories-section.tsx`
- Test: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1: Replace fixed 45/55vh heights with safe viewport heights**

Use `64svh` on mobile and `68svh` from tablet upward, with a 22rem minimum and a 52rem maximum. Tighten the mobile heading margins so short-height screens still show the whole card and progress line.

### Task 6: Simplify and recolour the mobile donation form

**Files:**
- Modify: `components/donations/donation-experience.css`
- Modify: `components/donations/donation-fields.tsx`
- Test: `components/sections/homepage-responsive-feedback.test.mjs`
- Test: `components/donations/donation-structure.test.mjs`

- [x] **Step 1: Remove editorial overhead on phones**

Hide the vow and form-head below 768 px, shorten the provider-unavailable note, reduce the Serkan stage, and keep the mood caption.

- [x] **Step 2: Use a compact branded horizontal tier rail**

Use snapping cream cards, an amber selected state, visible dark/amber contrast, compact descriptions, and native radio focus states. Keep four tier controls and the existing amount-to-mood state. Present the help feed as a separate dark warm ribbon with snapping cream entries.

- [x] **Step 3: Reduce field noise**

Hide optional explanatory label suffixes on phones, keep fields at 48 px minimum, keep the cadence segmented control, and show one concise disabled payment status.

### Task 7: Verify code and live server

**Files:**
- Verify only.

- [x] **Step 1: Run focused and full tests**

```powershell
& $nodeExe --test components/sections/homepage-responsive-feedback.test.mjs components/donations/donation-structure.test.mjs components/sections/homepage-media-structure.test.mjs
& $nodeExe --experimental-strip-types --test <existing full test list>
```

Expected: all tests pass.

- [x] **Step 2: Run TypeScript and ESLint**

```powershell
& $nodeExe node_modules/typescript/bin/tsc --noEmit
& $nodeExe node_modules/eslint/bin/eslint.js components/sections/hero-section.tsx components/sections/about-section.tsx components/sections/rescued-ring.tsx components/sections/dogs-stories-section.tsx components/donations
```

Expected: exit 0.

- [x] **Step 3: Check the running page**

Request `http://localhost:3000/#donate`, require HTTP 200, and confirm the new donation panel and deferred-provider copy are in the rendered HTML. Inspect the live route in the internal browser at phone, tablet, and desktop widths before completion.

### Task 8: Encode the second screenshot review

**Files:**
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`
- Modify: `components/donations/donation-structure.test.mjs`

- [x] **Step 1: Add source contracts before production edits**

Assert an intrinsic `.hero-actions__secondary-group`, a 6:5 panorama, a square
compact ring through 1180 px, centred fluid About metrics, and semantic donation
tabs whose feed panel contains `DonationFeed`.

- [x] **Step 2: Run the two tests and verify RED**

```powershell
& $nodeExe --test components/sections/homepage-responsive-feedback.test.mjs components/donations/donation-structure.test.mjs
```

Expected: FAIL because the new grouped controls, square path and tab shell do
not yet exist.

### Task 9: Repair the responsive compositions

**Files:**
- Modify: `components/sections/hero-section.tsx`
- Modify: `components/sections/about-section.tsx`
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`
- Modify: `app/globals.css`

- [x] **Step 1: Group `Найти друга` and play in the DOM**

Use two intrinsic flex children: the primary link and a non-wrapping secondary
group. Allow the outer flex container to wrap naturally and centre wrapped rows.

- [x] **Step 2: Enlarge About and the documentary panorama**

Centre single-column metrics, scale portraits with `clamp()`, keep the existing
count-up motion, set `.about-panorama { aspect-ratio: 6 / 5; }`, and reduce only
the section's bottom padding.

- [x] **Step 3: Use a square compact ring**

Set the compact media-query boundary and JS matchMedia query to 1180 px. Use a
560 by 560 canvas and one circular compact `offset-path`; keep copy centred and
increase compact line and body sizes with bounded `clamp()` values.

- [x] **Step 4: Run the focused responsive test and verify GREEN**

```powershell
& $nodeExe --test components/sections/homepage-responsive-feedback.test.mjs
```

Expected: PASS.

### Task 10: Rebuild donation as the Lightyar Fastpaw blank

**Files:**
- Modify: `components/donations/donation-experience.tsx`
- Modify: `components/donations/donation-fields.tsx`
- Modify: `components/donations/donation-experience.css`
- Test: `components/donations/donation-structure.test.mjs`

- [x] **Step 1: Add the semantic tab shell**

Use `role="tablist"`, two buttons with `aria-selected` and `aria-controls`, and
two labelled tabpanels. Preserve DOM order and add Left/Right/Home/End keyboard
navigation without a new dependency.

- [x] **Step 2: Apply the Fastpaw warm-blank structure**

Keep the editorial vow, form rule and tier radios. Integrate Serkan over the
paper panel, retain the horizontal snap tier rail below 768 px, remove premature
contact fields, and keep the disabled provider message explicit.

- [x] **Step 3: Restyle the feed as the second-panel heroes list**

Use light paper rows, amber numbered avatars and amounts, a bounded vertical
list on desktop and one readable column on phones. Preserve ready, empty and
unavailable states.

- [x] **Step 4: Run the focused donation test and verify GREEN**

```powershell
& $nodeExe --test components/donations/donation-structure.test.mjs
```

Expected: PASS.

### Task 11: Browser and project verification

**Files:** Verify only.

- [x] **Step 1:** Inspect 320×568, 390×844, 635×840, 768×900,
  1010×900 and 1440×900 in the internal browser. Measure page overflow,
  button wrapping, panorama ratio, ring square geometry and both donation tabs.
- [x] **Step 2:** Run focused tests, the full 58-test suite, TypeScript, targeted
  ESLint, `git diff --check`, and HTTP 200 on `http://localhost:3000/#donate`.
- [x] **Step 3:** Leave the user browser at the changed section, reset any
  viewport override and do not commit.

### Task 12: Polish donation controls and helpers feed

**Files:**
- Modify: `components/donations/donation-experience.tsx`
- Modify: `components/donations/donation-pet.tsx`
- Modify: `components/donations/donation-tier-picker.tsx`
- Modify: `components/donations/donation-fields.tsx`
- Modify: `components/donations/donation-feed.tsx`
- Modify: `components/donations/donation-experience.css`
- Test: `components/donations/donation-structure.test.mjs`

- [x] **Step 1:** Keep the responsive Serkan mood scene but remove its redundant
  name/status caption and the medical-cross decoration.
- [x] **Step 2:** Rename the feed tab to `Помощники` and add distinct icons to
  the tabs, amount tiers, cadence choices, and helper rows.
- [x] **Step 3:** Distinguish `Опека · каждый месяц` from
  `Разовая помощь · один раз`, remove tier sequence numbers, and align tier copy
  vertically.
- [x] **Step 4:** Keep phone tiers as a visible native horizontal snap rail and
  make the helpers list a bounded nested scroller with `data-lenis-prevent`.
- [x] **Step 5:** Use an intrinsic-width provider button with an icon, arrow and
  reduced-motion-safe shimmer while preserving the explicit deferred-payment
  state.
- [x] **Step 6:** Verify the live form at 320, 390, 635 and 1440 px, including
  zero page overflow, nested feed scroll, tier overflow and both tab states.

### Task 13: Encode the third visual review

**Files:**
- Modify: `components/donations/donation-structure.test.mjs`
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`
- Modify: `components/sections/homepage-media-structure.test.mjs`

- [x] **Step 1:** Add source contracts for edge-aligned icon hero actions,
  interactive donation tabs, contact/anonymous/consent controls, a custom tier
  card, ten helper icons, the `Нужды приюта` copy and taller responsive media.
- [x] **Step 2:** Run the focused contracts and confirm RED because the current
  production components still encode the superseded review.

### Task 14: Complete hero and donation form

**Files:**
- Modify: `components/sections/hero-section.tsx`
- Modify: `app/globals.css`
- Modify: `components/donations/donation-experience.tsx`
- Modify: `components/donations/donation-tier-picker.tsx`
- Modify: `components/donations/donation-fields.tsx`
- Modify: `components/donations/donation-feed.tsx`
- Modify: `components/donations/donation-experience.css`

- [x] **Step 1:** Add HeartHandshake and PawPrint to the two hero links and
  anchor the action group to an edge at every layout mode.
- [x] **Step 2:** Add tab hover/focus/active states without changing semantic
  tab keyboard behavior.
- [x] **Step 3:** Move custom amount into a fifth amount card; add controlled
  name, email, anonymous and privacy-consent fields while keeping the provider
  action disabled.
- [x] **Step 4:** Reduce helper icons to ten, remove redundant one-time copy and
  rebuild the helper heading without a bottom rule.
- [x] **Step 5:** Run donation and responsive contracts and confirm GREEN.

### Task 15: Rework needs, volunteer and responsive media

**Files:**
- Modify: `components/sections/needs-section.tsx`
- Modify: `components/sections/needs-section.css`
- Modify: `components/sections/volunteer-section.tsx`
- Modify: `components/sections/volunteer-section.css`
- Modify: `components/news/news-card.tsx`
- Create: `components/news/news-card.css`

- [x] **Step 1:** Rename the wishlist to `Нужды приюта`, remove the dynamic
  urgency count and place a standalone `или` between two light actions.
- [x] **Step 2:** Increase wishlist and news media height on phone/tablet while
  retaining bounded desktop cards and accurate responsive image sizes.
- [x] **Step 3:** Replace the dark volunteer layout with the approved light
  documentary spread and icon-led action list.
- [x] **Step 4:** Run homepage media and responsive contracts and confirm GREEN.

### Task 16: Live browser and project verification

**Files:** Verify only.

> 2026-08-31: the live browser exposed and drove fixes for the 390 px hero wrap,
> stale webpack CSS cache and narrow two-column donor fields. The final clean
> rebuild could not be re-opened by automation because the in-app browser URL
> policy blocked further localhost access; the remaining acceptance matrix stays
> intentionally unchecked for manual review rather than being claimed from source.

- [ ] **Step 1:** Inspect hero, both donation tabs, all form controls, needs,
  volunteer and news at 320×568, 390×844, 768×900, 1010×900 and 1440×900.
- [ ] **Step 2:** Verify tab pointer/keyboard states, native tier/cadence controls,
  anonymous-name disabling, privacy link, nested Lenis scroll and carousel
  overflow without page-level overflow.
- [ ] **Step 3:** Run focused and full tests, TypeScript, targeted ESLint,
  `git diff --check` and HTTP 200. Reset the browser viewport, leave it on the
  changed area and do not commit.

### Task 17: Encode and implement the fourth responsive review

**Files:**
- Modify: `components/donations/donation-experience.tsx`
- Modify: `components/donations/donation-fields.tsx`
- Modify: `components/donations/donation-experience.css`
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`
- Modify: `components/sections/needs-section.tsx`
- Modify: `components/sections/needs-section.css`
- Modify: `components/sections/volunteer-section.tsx`
- Modify: `components/sections/volunteer-section.css`
- Test: `components/donations/donation-structure.test.mjs`
- Test: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1:** Put the custom amount input below its copy and keep the custom
  card last; distinguish the two cadence choices visually.
- [x] **Step 2:** Turn anonymous help into a toggle that removes identity and
  consent fields and clears stale consent; centre the provider action.
- [x] **Step 3:** Keep Serkan above the tablet form rather than beside or behind
  its controls.
- [x] **Step 4:** Make `.ring-visual` the container-query source and protect the
  phone copy with a central paper mask that works for every animation phase.
- [x] **Step 5:** Balance the wishlist still-life and restore the volunteer
  section as a full-viewport photograph.
- [x] **Step 6:** Show 1.5 wishlist cards from 560 through 1099 px and reduce the
  phone/tablet media stage by about 15 percent.

### Task 18: Final acceptance for the fourth review

**Files:** Verify only.

- [x] **Step 1:** In the internal browser, confirm 1.53 visible wishlist cards
  at 768 px and 1.52 at 1024 px, with zero horizontal page overflow.
- [x] **Step 2:** In the internal browser, confirm the 390 px ring fit and visual
  are the same square size and the animated portraits no longer cover its copy.
- [x] **Step 3:** Run the full test, type, lint and whitespace verification after
  the final source changes; do not commit.

### Task 19: Encode and implement the fifth visual review

**Files:**
- Modify: `components/donations/donation-experience.css`
- Modify: `components/sections/payment-section.tsx`
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`
- Modify: `components/sections/needs-section.tsx`
- Modify: `components/sections/volunteer-section.css`
- Modify: `components/sections/footer.tsx`
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1:** Keep the mobile custom amount card last by resetting its
  desktop full-row grid placement at the phone breakpoint.
- [x] **Step 2:** Lighten the first donation-heading phrase and let the intro
  paragraph span the available mobile width.
- [x] **Step 3:** Remove the rescued copy mask, restore the open animal orbit,
  strengthen the amber section transition, remove `Кто мы` and replace the
  repeated lead with `Спасаем — и остаёмся рядом.`
- [x] **Step 4:** Arrange all three wishlist objects around the cat.
- [x] **Step 5:** Rebuild the volunteer actions as individual reference-style
  warm cards over the full-screen photograph.
- [x] **Step 6:** Replace the placeholder VK glyph with a filled VK mark.

### Task 20: Final acceptance for the fifth review

**Files:** Verify only.

- [x] **Step 1:** Inspect 320, 390, 535, 945 and 1440 px in the internal browser,
  including donation order and typography, open ring geometry, wishlist
  still-life, volunteer cards and footer VK mark, with zero page overflow.
- [x] **Step 2:** Run focused and full tests, TypeScript, targeted ESLint,
  `git diff --check` and HTTP 200 after the final source changes; do not commit.

### Task 21: Replace the rejected separator and fixed wishlist composition

**Files:**
- Modify: `components/sections/rescued-ring.css`
- Modify: `components/sections/needs-section.tsx`
- Modify: `components/sections/needs-section.css`
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1:** Remove the amber clipped-ellipse separator entirely.
- [x] **Step 2:** Replace three hand-authored coordinates with equal orbit
  angles `-90`, `30`, `150` and a single 24-second rotation.
- [x] **Step 3:** Counter-rotate the object art so packages stay upright and
  preserve the same 120-degree spacing in reduced-motion mode.
- [x] **Step 4:** Confirm the three measured browser gaps are exactly 120
  degrees at 945 px and inspect the complete composition at 535 px.
- [x] **Step 5:** Run the focused and full verification after the final visual
  adjustment; do not commit.

### Task 22: Polish the volunteer mobile composition and news media height

**Files:**
- Modify: `components/sections/volunteer-section.css`
- Modify: `components/news/news-card.css`
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`

- [x] **Step 1:** Replace the three generic floating volunteer cards with one
  compact editorial role ledger and distinct warm icon stamps.
- [x] **Step 2:** Remove the stretched mobile grid row, vertically centre the
  copy/actions as one composition, and centre the application CTA.
- [x] **Step 3:** Reduce the phone news media stage from 62svh to 52.7svh with
  proportionally reduced clamp bounds.
- [x] **Step 4:** Confirm 455 px geometry: no 168 px content gap, CTA centred,
  and news media reduced from 519.6 px to 441.6 px.
- [x] **Step 5:** Run the full test, type, lint, whitespace and HTTP checks; do
  not commit.

### Task 23: Implement the sixth annotated visual review and official copy

**Files:**
- Modify: `components/sections/about-section.tsx`
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`
- Modify: `components/sections/payment-section.tsx`
- Modify: `components/donations/donation-experience.css`
- Modify: `components/sections/volunteer-section.tsx`
- Modify: `components/sections/volunteer-section.css`
- Modify: `components/sections/footer.tsx`
- Modify: `components/sections/homepage-responsive-feedback.test.mjs`

- [ ] **Step 1:** Add failing source contracts for lower spacing, centred
  numerals, supplied copy, donation typography, volunteer motion, and VK.
- [ ] **Step 2:** Replace the rescued and donation copy while preserving CMS
  counts and donation behaviour.
- [ ] **Step 3:** Rebuild volunteer roles as separate warm photographic tags,
  centre the copy, and add reduced-motion-safe motion.
- [ ] **Step 4:** Add About breathing space and embed the official VK mark.
- [ ] **Step 5:** Run code, browser, detector, HTTP and responsive verification;
  do not commit.
